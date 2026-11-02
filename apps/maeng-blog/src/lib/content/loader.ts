// 파일시스템 빌드타임 콘텐츠 로더 — REQ-BLOG-002
// 디렉터리 계약(plan.md §B.1): content/{markdowns/{category}/,images/,til/}
// — 레거시 maeng-bucket 미러. TIL 라우트는 제거됐고 content/til 은 읽지 않는다.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { formatDate, parseLenientDate } from './date'
import { buildExcerpt } from './excerpt'
import { countCharacters, estimateReadingMinutes } from './reading-time'
import { resolveThumbnail, rewriteLegacyImagePaths } from './images'
import { pickRelated, sortByDateDesc } from './list'
import { renderMarkdown } from './render'
import type { AdjacentPosts, Post, PostMeta } from './types'

// 테스트 환경(vitest)에서만 MAENG_CONTENT_DIR 로 픽스처 디렉터리를 주입 — 프로덕션 빌드는 기존 process.cwd()/content 그대로 (REQ-MIG-005)
const CONTENT_DIR = process.env.MAENG_CONTENT_DIR ?? path.join(process.cwd(), 'content')
const MARKDOWNS_DIR = path.join(CONTENT_DIR, 'markdowns')

interface RawPost {
  meta: PostMeta
  body: string
}

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(entry.parentPath, entry.name))
}

function readRawPost(filePath: string): RawPost {
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)

  const relative = path.relative(MARKDOWNS_DIR, filePath).replace(/\.md$/, '')
  const slugParts = relative.split(path.sep)
  const date = parseLenientDate(data.date as string | Date)

  const meta: PostMeta = {
    slug: slugParts.join('/'),
    slugParts,
    title: String(data.title ?? '').trim(),
    date,
    dateFormatted: formatDate(date),
    category: String(data.category ?? '').trim(),
    thumbnail: resolveThumbnail(data.thumbnail),
    draft: data.draft === true,
    excerpt: buildExcerpt(content),
    readingMinutes: estimateReadingMinutes(content),
    charCount: countCharacters(content),
  }
  return { meta, body: content }
}

function readAllRawPosts(): RawPost[] {
  return listMarkdownFiles(MARKDOWNS_DIR).map((filePath) => {
    try {
      return readRawPost(filePath)
    } catch (error) {
      // SPEC ④ 대량 이관 시 어떤 파일이 실패했는지 진단 가능해야 한다
      throw new Error(`Failed to parse content file: ${filePath}`, { cause: error })
    }
  })
}

// @MX:ANCHOR: [AUTO] 비-draft 포스트 목록의 단일 진입점 — 목록 페이지/상세 generateStaticParams/카테고리 유도가 모두 이 함수를 소비 (fan_in >= 3)
// @MX:REASON: draft 제외 + date 내림차순 계약(REQ-BLOG-002/003)이 여기서 일괄 보장된다. 이 계약이 깨지면 draft 노출·목록 순서 회귀가 전 표면으로 전파됨
/** 비-draft 포스트 메타 전건 — date 내림차순 (REQ-BLOG-002 draft 제외 계약) */
export function getAllPosts(): PostMeta[] {
  return sortByDateDesc(readAllRawPosts().map((p) => p.meta)).filter((p) => !p.draft)
}

/** 콘텐츠에 존재하는 카테고리 목록 (비-draft 기준, 중복 제거) */
export function getAllCategories(): string[] {
  return [...new Set(getAllPosts().map((p) => p.category))]
}

/** slug 세그먼트로 단일 포스트 로드 + 렌더. draft/미존재 → null */
export async function getPostBySlug(slugParts: string[]): Promise<Post | null> {
  const slug = slugParts.join('/')
  const raw = readAllRawPosts().find((p) => p.meta.slug === slug)
  if (!raw || raw.meta.draft) return null

  const { html, headings } = await renderMarkdown(rewriteLegacyImagePaths(raw.body))
  return { ...raw.meta, html, headings }
}

/** 상세 하단 내비 — date 내림차순 목록 기준 prev=더 오래된 글, next=더 최신 글 (draft 제외) */
export function getAdjacentPosts(slug: string): AdjacentPosts {
  const posts = getAllPosts()
  const index = posts.findIndex((p) => p.slug === slug)
  if (index < 0) return { prev: null, next: null }
  return { prev: posts[index + 1] ?? null, next: posts[index - 1] ?? null }
}

/** 이어서 읽을 글 — 같은 카테고리 최신순 우선, 부족하면 다른 글 (draft 제외) */
export function getRelatedPosts(slug: string, limit = 2, exclude: readonly string[] = []): PostMeta[] {
  const posts = getAllPosts()
  const current = posts.find((p) => p.slug === slug)
  if (!current) return []
  return pickRelated(posts, current, limit, exclude)
}

