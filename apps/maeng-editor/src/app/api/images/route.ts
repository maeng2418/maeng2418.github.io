// 이미지 업로드 Route Handler — REQ-EDITOR-006
// FormData 네이티브 처리(multer 미도입), 키 스킴 blog/images/{uuid}.{ext} (legacy URL 호환).
import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getS3Env } from '@/lib/server/env'
import { getS3Client } from '@/lib/server/s3'

const EXTENSION_PATTERN = /^[a-z0-9]{1,8}$/i

const MIME_EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
}

function resolveExtension(file: File): string | null {
  const fromName = file.name.includes('.') ? file.name.split('.').pop() : undefined
  if (fromName && EXTENSION_PATTERN.test(fromName)) return fromName.toLowerCase()
  return MIME_EXTENSION[file.type] ?? null
}

export async function POST(request: Request): Promise<Response> {
  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get('file')
  } catch {
    return NextResponse.json({ error: 'multipart FormData 요청이 아닙니다' }, { status: 400 })
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'file 필드(이미지 파일)가 필요합니다' }, { status: 400 })
  }
  const extension = resolveExtension(file)
  if (!extension) {
    return NextResponse.json(
      { error: `지원하지 않는 파일 형식입니다: ${file.type || file.name}` },
      { status: 400 }
    )
  }

  try {
    const env = getS3Env()
    const key = `${env.imagePrefix}/${randomUUID()}.${extension}`

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: env.bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type || undefined,
      })
    )

    return NextResponse.json({ imageUrl: `${env.cloudfrontUrl}/${key}`, key })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `이미지 업로드 실패: ${message}` }, { status: 500 })
  }
}
