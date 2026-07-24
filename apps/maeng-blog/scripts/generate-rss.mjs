// 빌드 후처리 RSS 생성 — REQ-ENH-007 (design.md §3)
// `next build` 산출물 확정 이후 실행되어 out/rss.xml 을 기록한다 (pagefind 와 동일 후처리 체인).
// 콘텐츠 규약은 src/lib/content 로더와 동일 계약을 따른다(비-draft만, date 내림차순, 관대한
// 날짜 파싱). 로더(.ts)는 .mjs 에서 직접 import 할 수 없어(확장자 없는 상대 import) 최소
// 재구현하되, 사이트 URL 은 src/lib/site.ts 의 단일 상수를 파싱해 재사용한다 (드리프트 방지).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Feed } from 'feed'
import matter from 'gray-matter'

const APP_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** src/lib/site.ts 의 SITE_URL 상수 재사용 (읽기 전용 — PRESERVE 계약) */
export function readSiteUrl(appRoot = APP_ROOT) {
  const source = readFileSync(join(appRoot, 'src', 'lib', 'site.ts'), 'utf8')
  const match = /SITE_URL\s*=\s*'([^']+)'/.exec(source)
  if (!match) throw new Error('SITE_URL constant not found in src/lib/site.ts')
  return match[1]
}

/** src/lib/content/date.ts parseLenientDate 계약 승계 — 한 자리 월/일 수용 */
const LENIENT_DATE_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/

export function parseLenientDate(input) {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) throw new Error('Invalid Date object')
    return input
  }
  const value = String(input).trim()
  const m = LENIENT_DATE_RE.exec(value)
  if (m) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = m
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  }
  const fallback = new Date(value)
  if (!Number.isNaN(fallback.getTime())) return fallback
  throw new Error(`Unparseable date value: "${value}"`)
}

/** src/lib/content/excerpt.ts buildExcerpt 계약 승계 — 마크다운 제거 평문 발췌 */
export function buildExcerpt(markdown, length = 160) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/[*_`~|]/g, '')
    .replace(/\$([^$\n]+)\$/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= length) return plain
  return `${plain.slice(0, length).trimEnd()}…`
}

/** 비-draft 포스트 수집 — date 내림차순 (loader.ts getAllPosts 계약. TIL 은 페이지 URL 이
 * 없어 RSS 미포함 — research.md §3) */
export function collectPosts(contentDir) {
  const markdownsDir = join(contentDir, 'markdowns')
  if (!existsSync(markdownsDir)) return []
  const files = readdirSync(markdownsDir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => join(entry.parentPath, entry.name))

  return files
    .map((filePath) => {
      const { data, content } = matter(readFileSync(filePath, 'utf8'))
      const slug = relative(markdownsDir, filePath).replace(/\.md$/, '').split(sep).join('/')
      return {
        slug,
        title: String(data.title ?? '').trim(),
        date: parseLenientDate(data.date),
        draft: data.draft === true,
        excerpt: buildExcerpt(content),
      }
    })
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

/** RSS 2.0 XML 생성 (feed 6.0.0 — API 는 5.x 와 동일: Feed/addItem/rss2, R3 해소) */
export function buildRss(posts, siteUrl) {
  const feed = new Feed({
    id: `${siteUrl}/`,
    link: `${siteUrl}/`,
    title: 'MAENG — 기록은 미래의 나를 돕는다',
    description: '김명성의 개발 블로그 — 프런트엔드, 자바스크립트, 웹 기술 기록.',
    language: 'ko',
    copyright: `© ${new Date().getFullYear()} Myeongseong Kim`,
    updated: posts[0]?.date,
    feedLinks: { rss: `${siteUrl}/rss.xml` },
  })
  for (const post of posts) {
    const url = `${siteUrl}/posts/${post.slug}/`
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.excerpt,
      date: post.date,
    })
  }
  return feed.rss2()
}

function main() {
  const contentDir = join(APP_ROOT, 'content')
  const outDir = join(APP_ROOT, 'out')
  const posts = collectPosts(contentDir)
  const xml = buildRss(posts, readSiteUrl())
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'rss.xml'), xml)
  console.log(`[generate-rss] wrote out/rss.xml (${posts.length} items)`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
