// POST /api/images — 이미지 업로드. 서버 타깃 전용 라우트(design.md §B D5).
// 크기 상한 10 MiB(10,485,760 바이트), 지원 MIME 만 허용, randomUUID 고유 파일명(REQ-STORE-011).
import { NextResponse } from 'next/server'
import { createImageStore } from '@/lib/editor-server/store'

// design.md §B D5 — 10 MiB = 10,485,760 바이트(원본 기준)
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

const MIME_EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
}

function resolveExtension(file: File): string | null {
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

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: `이미지가 상한(${MAX_IMAGE_BYTES} 바이트 = 10 MiB)을 초과합니다: ${file.size} 바이트` },
      { status: 413 }
    )
  }

  const extension = resolveExtension(file)
  if (!extension) {
    return NextResponse.json(
      { error: `지원하지 않는 이미지 형식입니다: ${file.type || file.name}` },
      { status: 400 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await createImageStore().put({
      fileName: `upload.${extension}`,
      contentType: file.type,
      buffer,
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `이미지 업로드 실패: ${message}` }, { status: 500 })
  }
}
