// 로컬 블로그 미리보기 동기화 — REQ-EDITOR-008 (capability gate)
// Where BLOG_CONTENT_DIR 설정 시: S3 마크다운/이미지를 블로그 loader 기대 레이아웃
// (markdowns/{category}/, images/)으로 다운로드. 미설정 시 기능 비활성(숨김).
import fs from 'node:fs/promises'
import path from 'node:path'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { buildMarkdownListPrefix, parseMarkdownKey } from '@/lib/content-contract/keys'
import { getBlogContentDir, getS3Env } from './env'
import { getS3Client, listAllKeys } from './s3'

export function isBlogSyncEnabled(): boolean {
  return getBlogContentDir() !== null
}

export interface BlogSyncResult {
  markdowns: number
  images: number
  targetDir: string
}

export async function syncToBlogContentDir(): Promise<BlogSyncResult> {
  const targetDir = getBlogContentDir()
  if (!targetDir) {
    throw new Error('블로그 미리보기 동기화 비활성: BLOG_CONTENT_DIR env 가 설정되지 않았습니다')
  }

  const env = getS3Env()
  const s3 = getS3Client()

  // 마크다운 — markdowns/{category}/{fileName}.md 미러
  let markdowns = 0
  for (const key of await listAllKeys(buildMarkdownListPrefix(env.markdownPrefix))) {
    const parsed = parseMarkdownKey(key, env.markdownPrefix)
    if (!parsed) continue

    const result = await s3.send(new GetObjectCommand({ Bucket: env.bucket, Key: key }))
    if (!result.Body) continue
    const text = await result.Body.transformToString('utf-8')

    const filePath = path.join(targetDir, 'markdowns', parsed.category, `${parsed.fileName}.md`)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, text, 'utf-8')
    markdowns += 1
  }

  // 이미지 — images/ 평면 미러 (블로그 images/ 디렉터리 계약)
  let images = 0
  for (const key of await listAllKeys(`${env.imagePrefix}/`)) {
    const baseName = path.posix.basename(key)
    if (!baseName || key.endsWith('/')) continue

    const result = await s3.send(new GetObjectCommand({ Bucket: env.bucket, Key: key }))
    if (!result.Body) continue
    const bytes = await result.Body.transformToByteArray()

    const filePath = path.join(targetDir, 'images', baseName)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, Buffer.from(bytes))
    images += 1
  }

  return { markdowns, images, targetDir }
}
