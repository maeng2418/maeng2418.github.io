// 포스트 영속 서버 계층 — REQ-EDITOR-004/005 (S3 = source of truth)
// 직렬화/키 레이아웃은 content-contract 모듈(M2, 블로그 계약)을 그대로 소비한다.
import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3'
import { parsePostMarkdown, serializePostMarkdown } from '@/lib/content-contract/frontmatter'
import { buildMarkdownKey, buildMarkdownListPrefix, parseMarkdownKey } from '@/lib/content-contract/keys'
import type { PostFrontmatter } from '@/lib/content-contract/types'
import { getS3Env } from './env'
import { getS3Client } from './s3'

export interface SavePostInput {
  fileName: string
  frontmatter: PostFrontmatter
  body: string
}

export interface PostSummary {
  category: string
  fileName: string
  key: string
  /** ISO 문자열 (목록 정렬용) — S3 LastModified 부재 시 null */
  lastModified: string | null
}

export interface LoadedPost {
  frontmatter: PostFrontmatter
  body: string
  key: string
}

// @MX:NOTE: [AUTO] 저장 경로 — serializePostMarkdown(단일 직렬화 지점)을 통해서만 S3 에 쓴다
export async function savePost(input: SavePostInput): Promise<{ key: string }> {
  const env = getS3Env()
  const key = buildMarkdownKey(input.frontmatter.category, input.fileName, env.markdownPrefix)
  const markdown = serializePostMarkdown(input.frontmatter, input.body)

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: env.bucket,
      Key: key,
      Body: markdown,
      ContentType: 'text/markdown; charset=utf-8',
    })
  )
  return { key }
}

export async function listPosts(): Promise<PostSummary[]> {
  const env = getS3Env()
  const bucket = env.bucket
  const prefix = buildMarkdownListPrefix(env.markdownPrefix)
  const s3 = getS3Client()

  const summaries: PostSummary[] = []
  let continuationToken: string | undefined
  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    )
    for (const object of page.Contents ?? []) {
      const key = object.Key ?? ''
      const parsed = parseMarkdownKey(key, env.markdownPrefix)
      if (!parsed) continue
      summaries.push({
        category: parsed.category,
        fileName: parsed.fileName,
        key,
        lastModified: object.LastModified ? new Date(object.LastModified).toISOString() : null,
      })
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (continuationToken)

  return summaries.sort((a, b) => (b.lastModified ?? '').localeCompare(a.lastModified ?? ''))
}

export async function loadPost(category: string, fileName: string): Promise<LoadedPost> {
  const env = getS3Env()
  const key = buildMarkdownKey(category, fileName, env.markdownPrefix)

  const result = await getS3Client().send(
    new GetObjectCommand({ Bucket: env.bucket, Key: key })
  )
  if (!result.Body) {
    throw new Error(`empty object body: ${key}`)
  }
  const raw = await result.Body.transformToString('utf-8')
  const parsed = parsePostMarkdown(raw)
  return { frontmatter: parsed.frontmatter, body: parsed.body, key }
}
