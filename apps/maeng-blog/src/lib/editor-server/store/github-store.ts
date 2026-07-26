// GitHub 커밋 드라이버 — SPEC-MAENGV2-EDITOR-MERGE-006 M3 (design.md §B D4)
// 커밋 대상: maeng2418/maeng2418.github.io 리포의 apps/maeng-blog/content/** (branch main, plan.md §C C-4).
import { randomUUID } from 'node:crypto'
import { parsePostMarkdown, serializePostMarkdown } from '@/lib/content-contract/frontmatter'
import { assertSafeSegment, buildMarkdownKey, parseMarkdownKey } from '@/lib/content-contract/keys'
import { commitFiles, getFileContent, listTree } from '../github'
import type { GitHubRuntimeEnv } from '../env'
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

// 리포 내 콘텐츠 경로 접두사 — 모노레포이므로 앱 디렉터리부터 시작한다(design.md §B D4)
const CONTENT_PREFIX = 'apps/maeng-blog/content'
const MARKDOWNS_PREFIX = `${CONTENT_PREFIX}/markdowns/`
const IMAGES_PREFIX = `${CONTENT_PREFIX}/images`

export function createGitHubPostStore(env: GitHubRuntimeEnv): PostStore {
  return {
    async list(): Promise<PostSummary[]> {
      const entries = await listTree(env, MARKDOWNS_PREFIX)
      const results: PostSummary[] = []
      for (const entry of entries) {
        const parsed = parseMarkdownKey(entry.path, CONTENT_PREFIX)
        if (!parsed) continue
        results.push({
          key: `${parsed.category}/${parsed.fileName}`,
          category: parsed.category,
          fileName: parsed.fileName,
          // Git Trees API 는 커밋 시각을 제공하지 않는다 — 정렬 보조 정보로만 쓰이던 필드이므로 null 허용
          lastModified: null,
        })
      }
      return results
    },

    async load(category: string, fileName: string): Promise<LoadedPost> {
      assertSafeSegment('category', category)
      assertSafeSegment('fileName', fileName)
      const key = buildMarkdownKey(category, fileName, CONTENT_PREFIX)
      const file = await getFileContent(env, key)
      if (!file) throw new PostNotFoundError(category, fileName)
      const parsed = parsePostMarkdown(file.content)
      return { key: `${category}/${fileName}`, frontmatter: parsed.frontmatter, body: parsed.body }
    },

    async save(input: SavePostInput): Promise<SavePostResult> {
      assertSafeSegment('category', input.category)
      assertSafeSegment('fileName', input.fileName)
      const key = buildMarkdownKey(input.category, input.fileName, CONTENT_PREFIX)
      const markdown = serializePostMarkdown(input.frontmatter, input.body)
      const [result] = await commitFiles(env, [
        {
          path: key,
          content: markdown,
          message: `content(${input.category}/${input.fileName}): editor save via SPEC-MAENGV2-EDITOR-MERGE-006`,
        },
      ])
      return {
        key: `${input.category}/${input.fileName}`,
        date: input.frontmatter.date,
        commitUrl: result.commitUrl,
      }
    },
  }
}

export function createGitHubImageStore(env: GitHubRuntimeEnv): ImageStore {
  return {
    async put(image: StoredImageInput): Promise<StoredImageResult> {
      const extension = image.fileName.includes('.') ? image.fileName.split('.').pop() : undefined
      const unique = `${randomUUID()}${extension ? `.${extension}` : ''}`
      const key = `${IMAGES_PREFIX}/${unique}`
      const [result] = await commitFiles(env, [
        {
          path: key,
          content: image.buffer,
          message: `content(images/${unique}): editor upload via SPEC-MAENGV2-EDITOR-MERGE-006`,
        },
      ])
      return { path: `/content-images/${unique}`, commitUrl: result.commitUrl }
    },
  }
}
