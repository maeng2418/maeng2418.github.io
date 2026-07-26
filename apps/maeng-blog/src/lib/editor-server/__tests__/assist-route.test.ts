// POST /api/assist — SPEC-MAENGV2-EDITOR-MERGE-006 AC-M3-011/012 (REQ-ASSIST-001..003)
// M4 — `openai` SDK 제거(Worker 번들 크기 폴백, plan.md §C C-3) → global fetch 모킹으로 전환.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/assist/route.server'

function sseBody(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  process.env.OPENAI_API_KEY = 'test-openai-key'
  process.env.OPENAI_MODEL = 'env-injected-model'
  process.env.EDITOR_AUTH_TOKEN = 'x'.repeat(32)
  process.env.EDITOR_AUTH_DISABLED = '1'
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.OPENAI_MODEL
  delete process.env.OPENAI_API_KEY
  delete process.env.EDITOR_AUTH_TOKEN
  delete process.env.EDITOR_AUTH_DISABLED
})

describe('POST /api/assist (REQ-ASSIST-001/002)', () => {
  it('OPENAI_MODEL env 모델로 stream 요청을 만들고 토큰을 점진 스트리밍한다', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        sseBody([
          JSON.stringify({ choices: [{ delta: { content: '마크다운 ' } }] }),
          JSON.stringify({ choices: [{ delta: {} }] }),
          JSON.stringify({ choices: [{ delta: { content: '보조 ' } }] }),
          JSON.stringify({ choices: [{ delta: { content: '응답' } }] }),
        ]),
        { status: 200 }
      )
    )

    const response = await POST(makeRequest({ prompt: '결론 문단을 다듬어줘' }))
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/plain')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.openai.com/v1/chat/completions')
    const requestBody = JSON.parse(init.body as string) as { model: string; stream: boolean }
    expect(requestBody.model).toBe('env-injected-model')
    expect(requestBody.stream).toBe(true)
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-openai-key')

    const text = await new Response(response.body).text()
    expect(text).toBe('마크다운 보조 응답')
  })

  it('prompt 누락 시 400, OPENAI_MODEL 미설정 시 식별 가능한 500 에러를 응답한다', async () => {
    const bad = await POST(makeRequest({}))
    expect(bad.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()

    delete process.env.OPENAI_MODEL
    const noModel = await POST(makeRequest({ prompt: 'x' }))
    expect(noModel.status).toBe(500)
    const json = (await noModel.json()) as { error: string }
    expect(json.error).toContain('OPENAI_MODEL')
  })

  it('OPENAI_API_KEY 가 하드코딩 없이 env 로만 주입된다 (REQ-ASSIST-003)', async () => {
    fetchMock.mockResolvedValueOnce(new Response(sseBody([]), { status: 200 }))
    await POST(makeRequest({ prompt: 'x' }))
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-openai-key')
  })

  it('OpenAI 요청이 실패하면 500 과 원인 메시지를 반환한다', async () => {
    fetchMock.mockResolvedValueOnce(new Response('rate limited', { status: 429 }))
    const response = await POST(makeRequest({ prompt: 'x' }))
    expect(response.status).toBe(500)
    const json = (await response.json()) as { error: string }
    expect(json.error).toContain('429')
  })
})
