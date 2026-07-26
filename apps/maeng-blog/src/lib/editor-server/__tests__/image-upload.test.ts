// POST /api/images 라우트 핸들러 — SPEC-MAENGV2-EDITOR-MERGE-006
// AC-M3-004 (계약 경로), AC-M3-005 (10 MiB 경계), AC-M3-013 (고유 파일명), AC-M3-014 (미지원 MIME 거부)
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { POST } from '@/app/api/images/route.server'

let tmpRoot: string

function makeRequest(form: FormData): Request {
  return new Request('http://localhost/api/images', { method: 'POST', body: form })
}

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'maeng-image-upload-'))
  process.env.EDITOR_STORAGE_DRIVER = 'fs'
  process.env.MAENG_CONTENT_DIR = tmpRoot
})

afterEach(async () => {
  delete process.env.EDITOR_STORAGE_DRIVER
  delete process.env.MAENG_CONTENT_DIR
  await fs.rm(tmpRoot, { recursive: true, force: true })
})

describe('POST /api/images', () => {
  it('이미지를 저장하고 /content-images/ 계약 경로를 반환한다 (AC-M3-004)', async () => {
    const form = new FormData()
    form.append('file', new File([new Uint8Array([137, 80, 78, 71])], 'screenshot.png', { type: 'image/png' }))

    const response = await POST(makeRequest(form))
    expect(response.status).toBe(200)
    const json = (await response.json()) as { path: string }
    expect(json.path).toMatch(/^\/content-images\/[0-9a-f-]{36}\.png$/)
  })

  it('file 필드가 없으면 400 을 응답한다', async () => {
    const response = await POST(makeRequest(new FormData()))
    expect(response.status).toBe(400)
  })

  it('지원하지 않는 MIME(.txt)은 400 + 커밋 미발생이다 (AC-M3-014, E-5)', async () => {
    const form = new FormData()
    form.append('file', new File([new Uint8Array([1, 2])], 'note.txt', { type: 'text/plain' }))
    const response = await POST(makeRequest(form))
    expect(response.status).toBe(400)
    const files = await fs.readdir(path.join(tmpRoot, 'images')).catch(() => [])
    expect(files).toHaveLength(0)
  })

  it('10,485,760 바이트는 통과, 10,485,761 바이트는 거부된다 (AC-M3-005 경계 검증)', async () => {
    const ok = new File([new Uint8Array(10_485_760)], 'ok.png', { type: 'image/png' })
    const okForm = new FormData()
    okForm.append('file', ok)
    const okResponse = await POST(makeRequest(okForm))
    expect(okResponse.status).toBe(200)

    const tooBig = new File([new Uint8Array(10_485_761)], 'toobig.png', { type: 'image/png' })
    const bigForm = new FormData()
    bigForm.append('file', tooBig)
    const bigResponse = await POST(makeRequest(bigForm))
    expect(bigResponse.status).toBe(413)
  }, 15000)

  it('동일 이름 재업로드도 서로 다른 고유 경로로 저장된다 (AC-M3-013)', async () => {
    const makeForm = () => {
      const form = new FormData()
      form.append('file', new File([new Uint8Array([9, 9])], 'dup.png', { type: 'image/png' }))
      return form
    }
    const first = (await (await POST(makeRequest(makeForm()))).json()) as { path: string }
    const second = (await (await POST(makeRequest(makeForm()))).json()) as { path: string }
    expect(first.path).not.toBe(second.path)
    const files = await fs.readdir(path.join(tmpRoot, 'images'))
    expect(files).toHaveLength(2)
  })
})
