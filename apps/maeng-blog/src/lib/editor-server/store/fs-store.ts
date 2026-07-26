// 로컬 개발용 fs 드라이버 — SPEC-MAENGV2-EDITOR-MERGE-006 M3 (design.md §B D4)
// apps/maeng-blog/content/** 를 직접 읽고 쓴다. git 커밋은 사용자가 수동 수행한다(로컬 전용, E-7).
import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { parsePostMarkdown, serializePostMarkdown } from '@/lib/content-contract/frontmatter'
import { assertSafeSegment } from '@/lib/content-contract/keys'
import type {
  ImageStore,
  LoadedPost,
  PostStore,
  PostSummary,
  SavePostInput,
  SavePostResult,
  StoredImageInput,
  StoredImageResult,
} from './types'
import { PostNotFoundError } from './types'

// @MX:WARN: [AUTO] Cloudflare Workers 런타임에는 파일시스템이 없다 — fs 드라이버는 로컬 개발 전용이다
// @MX:REASON: Workers에서 이 드라이버가 선택되면 조용히 실패(빈 목록 등)하지 않고 기동/요청 시 명시적으로 throw 해야 한다(REQ-STORE-009, AC-M3-018, E-8)
function assertNodeFsAvailable(): void {
  if (typeof process === 'undefined' || !process.versions?.node) {
    throw new Error(
      'fs storage driver requires a Node.js filesystem — not available in this runtime (e.g. Cloudflare Workers). Set EDITOR_STORAGE_DRIVER=github.'
    )
  }
}

interface FsStoreOptions {
  /** 테스트/오버라이드용 콘텐츠 루트. 미지정 시 MAENG_CONTENT_DIR env → process.cwd()/content 순으로 해석한다 */
  contentDir?: string
}

function resolveContentDir(override?: string): string {
  return override ?? process.env.MAENG_CONTENT_DIR ?? path.join(process.cwd(), 'content')
}

export function createFsPostStore(options: FsStoreOptions = {}): PostStore {
  assertNodeFsAvailable()
  const contentDir = resolveContentDir(options.contentDir)
  const markdownsDir = path.join(contentDir, 'markdowns')

  return {
    async list(): Promise<PostSummary[]> {
      const entries = await fs
        .readdir(markdownsDir, { withFileTypes: true, recursive: true })
        .catch(() => [])
      const results: PostSummary[] = []
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.md')) continue
        const parentDir = entry.parentPath ?? path.dirname(path.join(markdownsDir, entry.name))
        const category = path.basename(parentDir)
        const fileName = entry.name.slice(0, -3)
        const stat = await fs.stat(path.join(parentDir, entry.name))
        results.push({
          key: `${category}/${fileName}`,
          category,
          fileName,
          lastModified: stat.mtime.toISOString(),
        })
      }
      return results
    },

    async load(category: string, fileName: string): Promise<LoadedPost> {
      assertSafeSegment('category', category)
      assertSafeSegment('fileName', fileName)
      const filePath = path.join(markdownsDir, category, `${fileName}.md`)
      const raw = await fs.readFile(filePath, 'utf8').catch(() => null)
      if (raw === null) throw new PostNotFoundError(category, fileName)
      const parsed = parsePostMarkdown(raw)
      return { key: `${category}/${fileName}`, frontmatter: parsed.frontmatter, body: parsed.body }
    },

    async save(input: SavePostInput): Promise<SavePostResult> {
      assertSafeSegment('category', input.category)
      assertSafeSegment('fileName', input.fileName)
      const dir = path.join(markdownsDir, input.category)
      await fs.mkdir(dir, { recursive: true })
      const filePath = path.join(dir, `${input.fileName}.md`)
      const markdown = serializePostMarkdown(input.frontmatter, input.body)
      await fs.writeFile(filePath, markdown, 'utf8')
      return { key: `${input.category}/${input.fileName}`, date: input.frontmatter.date }
    },
  }
}

export function createFsImageStore(options: FsStoreOptions = {}): ImageStore {
  assertNodeFsAvailable()
  const contentDir = resolveContentDir(options.contentDir)
  const imagesDir = path.join(contentDir, 'images')

  return {
    async put(image: StoredImageInput): Promise<StoredImageResult> {
      await fs.mkdir(imagesDir, { recursive: true })
      const extension = image.fileName.includes('.') ? image.fileName.split('.').pop() : undefined
      const unique = `${randomUUID()}${extension ? `.${extension}` : ''}`
      await fs.writeFile(path.join(imagesDir, unique), image.buffer)
      return { path: `/content-images/${unique}` }
    },
  }
}
