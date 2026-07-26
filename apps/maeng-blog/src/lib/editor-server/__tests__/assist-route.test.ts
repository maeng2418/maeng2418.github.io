// POST /api/assist — SPEC-MAENGV2-EDITOR-MERGE-006 AC-M3-011/012 (REQ-ASSIST-001..003)
// apps/maeng-editor 테스트를 이관 + editor-server/env 로 import 경로만 갱신.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { constructorSpy, createMock } = vi.hoisted(() => ({
  constructorSpy: vi.fn(),
  createMock: vi.fn(),
}))

vi.mock('openai', () => {
  class OpenAI {
    chat = { completions: { create: createMock } }
    constructor(options: Record<string, unknown>) {
      constructorSpy(options)
    }
  }
  return { default: OpenAI }
})

import { POST } from '@/app/api/assist/route.server'

function chunk(content: string) {
  return { choices: [{ delta: { content } }] }
}

async function* fakeStream() {
  yield chunk('마크다운 ')
  yield { choices: [{ delta: {} }] }
  yield chunk('보조 ')
  yield chunk('응답')
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  constructorSpy.mockReset()
  createMock.mockReset()
  process.env.OPENAI_API_KEY = 'test-openai-key'
  process.env.OPENAI_MODEL = 'env-injected-model'
})

describe('POST /api/assist (REQ-ASSIST-001/002)', () => {
  it('OPENAI_MODEL env 모델로 stream 요청을 만들고 토큰을 점진 스트리밍한다', async () => {
    createMock.mockResolvedValueOnce(fakeStream())

    const response = await POST(makeRequest({ prompt: '결론 문단을 다듬어줘' }))
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/plain')

    expect(createMock).toHaveBeenCalledTimes(1)
    const args = createMock.mock.calls[0][0] as Record<string, unknown>
    expect(args.model).toBe('env-injected-model')
    expect(args.stream).toBe(true)

    const text = await new Response(response.body).text()
    expect(text).toBe('마크다운 보조 응답')
  })

  it('prompt 누락 시 400, OPENAI_MODEL 미설정 시 식별 가능한 500 에러를 응답한다', async () => {
    const bad = await POST(makeRequest({}))
    expect(bad.status).toBe(400)
    expect(createMock).not.toHaveBeenCalled()

    delete process.env.OPENAI_MODEL
    const noModel = await POST(makeRequest({ prompt: 'x' }))
    expect(noModel.status).toBe(500)
    const json = (await noModel.json()) as { error: string }
    expect(json.error).toContain('OPENAI_MODEL')
  })

  it('OPENAI_API_KEY 가 하드코딩 없이 env 로만 주입된다 (REQ-ASSIST-003)', async () => {
    createMock.mockResolvedValueOnce(fakeStream())
    await POST(makeRequest({ prompt: 'x' }))
    expect(constructorSpy).toHaveBeenCalledWith({ apiKey: 'test-openai-key' })
  })
})
