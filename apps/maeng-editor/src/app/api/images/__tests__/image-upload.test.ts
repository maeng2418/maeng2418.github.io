// AC-EDITOR-005 — 이미지 업로드 Route Handler
// uuid 키 스킴(blog/images/{uuid}.{ext})·ContentType 전달·CloudFront URL 응답 (multer 미사용 — request.formData()).
import { beforeEach, describe, expect, it, vi } from 'vitest'

const sendMock = vi.hoisted(() => vi.fn())

vi.mock('@aws-sdk/client-s3', () => {
  class S3Client {
    send = sendMock
  }
  class PutObjectCommand {
    readonly input: Record<string, unknown>
    constructor(input: Record<string, unknown>) {
      this.input = input
    }
  }
  class ListObjectsV2Command {
    readonly input: Record<string, unknown>
    constructor(input: Record<string, unknown>) {
      this.input = input
    }
  }
  class GetObjectCommand {
    readonly input: Record<string, unknown>
    constructor(input: Record<string, unknown>) {
      this.input = input
    }
  }
  return { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand }
})

import { POST } from '@/app/api/images/route'

const UUID_KEY_PATTERN =
  /^blog\/images\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/

function makeRequest(form: FormData): Request {
  return new Request('http://localhost/api/images', { method: 'POST', body: form })
}

beforeEach(() => {
  sendMock.mockReset()
  process.env.AWS_REGION = 'ap-northeast-2'
  process.env.AWS_BUCKET_NAME = 'test-bucket'
  process.env.AWS_CLOUDFRONT_URL = 'https://cdn.example.com'
  process.env.AWS_BUCKET_MARKDOWN_FOLDER_PREFIX = 'blog'
  process.env.AWS_BUCKET_IMAGE_FOLDER_PREFIX = 'blog/images'
})

describe('POST /api/images (REQ-EDITOR-006)', () => {
  it('FormData 이미지를 blog/images/{uuid}.{ext} 키로 저장하고 CloudFront URL 을 응답한다', async () => {
    sendMock.mockResolvedValueOnce({})

    const form = new FormData()
    form.append(
      'file',
      new File([new Uint8Array([137, 80, 78, 71])], 'screenshot.png', { type: 'image/png' })
    )

    const response = await POST(makeRequest(form))
    expect(response.status).toBe(200)

    const put = sendMock.mock.calls[0][0] as { input: Record<string, unknown> }
    expect(put.constructor.name).toBe('PutObjectCommand')
    expect(put.input.Bucket).toBe('test-bucket')
    expect(String(put.input.Key)).toMatch(UUID_KEY_PATTERN)
    expect(put.input.ContentType).toBe('image/png')

    const json = (await response.json()) as { imageUrl: string }
    expect(json.imageUrl).toBe(`https://cdn.example.com/${put.input.Key}`)
  })

  it('file 필드가 없으면 400 을 응답하고 S3 호출을 하지 않는다', async () => {
    const response = await POST(makeRequest(new FormData()))
    expect(response.status).toBe(400)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('S3 업로드 실패 시 식별 가능한 에러 메시지로 500 을 응답한다', async () => {
    sendMock.mockRejectedValueOnce(new Error('S3 down'))
    const form = new FormData()
    form.append('file', new File([new Uint8Array([1])], 'a.png', { type: 'image/png' }))

    const response = await POST(makeRequest(form))
    expect(response.status).toBe(500)
    const json = (await response.json()) as { error: string }
    expect(json.error).toBeTruthy()
  })
})
