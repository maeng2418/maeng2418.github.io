// POST /api/assist — AI 글쓰기 보조 스트리밍. 구 저작 도구 앱 로직 이관(plan.md M3).
// 모델명은 OPENAI_MODEL env 에서만 읽는다(하드코딩 금지, REQ-ASSIST-002). 서버 경계 전용(REQ-ASSIST-003).
// M4 — `openai` SDK 대신 `fetch` 직접 호출을 사용한다(Worker 번들 크기 폴백, plan.md §C C-3/R3, AC-M4-006).
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireEditorAuth } from '@/lib/editor-server/auth'
import { getOpenAIEnv } from '@/lib/editor-server/env'

const AssistRequestSchema = z.object({
  prompt: z.string().min(1),
  /** 현재 에디터 문서(선택) — 문맥 기반 보조 */
  context: z.string().optional(),
})

const SYSTEM_PROMPT =
  '너는 한국어 기술 블로그의 마크다운 글쓰기 보조다. ' +
  '요청에 대해 마크다운 본문 조각만 답하고, 설명이나 인사말은 붙이지 않는다.'

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions'

interface OpenAIStreamChunk {
  choices?: Array<{ delta?: { content?: string } }>
}

/** OpenAI SSE(text/event-stream) 청크를 파싱해 텍스트 델타만 추출한다. */
function extractDelta(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) return null
  const data = trimmed.slice(5).trim()
  if (!data || data === '[DONE]') return null
  try {
    const parsed = JSON.parse(data) as OpenAIStreamChunk
    return parsed.choices?.[0]?.delta?.content ?? null
  } catch {
    return null
  }
}

export async function POST(request: Request): Promise<Response> {
  const denied = await requireEditorAuth(request)
  if (denied) return denied

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON 본문이 필요합니다' }, { status: 400 })
  }
  const parsed = AssistRequestSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'prompt 필드(1자 이상)가 필요합니다' }, { status: 400 })
  }

  let env
  try {
    env = getOpenAIEnv()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { prompt, context } = parsed.data

  let upstream: Response
  try {
    upstream = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.apiKey}`,
      },
      body: JSON.stringify({
        model: env.model,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...(context ? [{ role: 'user' as const, content: `현재 문서:\n\n${context}` }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `OpenAI 요청 실패: ${message}` }, { status: 500 })
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    return NextResponse.json(
      { error: `OpenAI 요청 실패: ${upstream.status}${detail ? ` ${detail}` : ''}` },
      { status: 500 }
    )
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const reader = upstream.body.getReader()

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const delta = extractDelta(line)
            if (delta) controller.enqueue(encoder.encode(delta))
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
