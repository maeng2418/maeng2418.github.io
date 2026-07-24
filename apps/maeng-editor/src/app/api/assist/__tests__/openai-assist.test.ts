// AC-EDITOR-006 — OpenAI 보조 글쓰기 스트리밍
// env 모델 주입(하드코딩 없음) + 스트림 응답 검증 (SDK 모킹 — 실 API 호출 없음).
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

import { POST } from '@/app/api/assist/route'

function chunk(content: string) {
  return { choices: [{ delta: { content } }] }
}

async function* fakeStream() {
  yield chunk('마크다운 ')
  yield { choices: [{ delta: {} }] } // 내용 없는 델타 (role 등) — 무시되어야 함
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

describe('POST /api/assist (REQ-EDITOR-007)', () => {
  it('OPENAI_MODEL env 모델로 stream 요청을 만들고 토큰을 점진 스트리밍한다', async () => {
    createMock.mockResolvedValueOnce(fakeStream())

    const response = await POST(makeRequest({ prompt: '결론 문단을 다듬어줘' }))
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/plain')

    expect(createMock).toHaveBeenCalledTimes(1)
    const args = createMock.mock.calls[0][0] as Record<string, unknown>
    expect(args.model).toBe('env-injected-model') // 하드코딩 아님 — env 주입
    expect(args.stream).toBe(true)

    expect(response.body).not.toBeNull()
    const text = await new Response(response.body).text()
    expect(text).toBe('마크다운 보조 응답')
  })

  it('문서 컨텍스트를 함께 보내면 메시지에 포함된다', async () => {
    createMock.mockResolvedValueOnce(fakeStream())

    await POST(makeRequest({ prompt: '이어서 써줘', context: '# 제목\n\n본문' }))

    const args = createMock.mock.calls[0][0] as {
      messages: Array<{ role: string; content: string }>
    }
    expect(args.messages.some((m) => m.content.includes('# 제목'))).toBe(true)
    expect(args.messages.at(-1)?.content).toContain('이어서 써줘')
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
})
