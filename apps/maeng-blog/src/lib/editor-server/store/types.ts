// PostStore/ImageStore 드라이버 계약 — SPEC-MAENGV2-EDITOR-MERGE-006 M3 (design.md §B D4)
import type { PostFrontmatter } from '@/lib/content-contract/types'

export interface PostSummary {
  key: string
  category: string
  fileName: string
  lastModified: string | null
}

export interface LoadedPost {
  key: string
  frontmatter: PostFrontmatter
  body: string
}

export interface SavePostInput {
  category: string
  fileName: string
  frontmatter: PostFrontmatter
  body: string
}

export interface SavePostResult {
  key: string
  date: string
  commitUrl?: string
}

export class PostNotFoundError extends Error {
  constructor(category: string, fileName: string) {
    super(`post not found: ${category}/${fileName}`)
    this.name = 'PostNotFoundError'
  }
}

export interface PostStore {
  list(): Promise<PostSummary[]>
  load(category: string, fileName: string): Promise<LoadedPost>
  save(input: SavePostInput): Promise<SavePostResult>
}

export interface StoredImageInput {
  /** 업로드 원본 파일명 — 확장자 유도에만 사용, 저장 키에는 쓰이지 않는다(고유 파일명 강제) */
  fileName: string
  contentType: string
  buffer: Buffer
}

export interface StoredImageResult {
  /** 블로그 계약 경로 — design.md §B D5, `/content-images/{unique}.{ext}` 로 시작 */
  path: string
  commitUrl?: string
}

export interface ImageStore {
  put(image: StoredImageInput): Promise<StoredImageResult>
}
