// POST /api/assist — AI 글쓰기 보조 스트리밍. apps/maeng-editor 로직 이관(plan.md M3).
// 모델명은 OPENAI_MODEL env 에서만 읽는다(하드코딩 금지, REQ-ASSIST-002). 서버 경계 전용(REQ-ASSIST-003).
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { getOpenAIEnv } from '@/lib/editor-server/env'

const AssistRequestSchema = z.object({
  prompt: z.string().min(1),
  /** 현재 에디터 문서(선택) — 문맥 기반 보조 */
  context: z.string().optional(),
})

const SYSTEM_PROMPT =
  '너는 한국어 기술 블로그의 마크다운 글쓰기 보조다. ' +
  '요청에 대해 마크다운 본문 조각만 답하고, 설명이나 인사말은 붙이지 않는다.'

export async function POST(request: Request): Promise<Response> {
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

  const client = new OpenAI({ apiKey: env.apiKey })
  const { prompt, context } = parsed.data

  try {
    const stream = await client.chat.completions.create({
      model: env.model,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(context ? [{ role: 'user' as const, content: `현재 문서:\n\n${context}` }] : []),
        { role: 'user', content: prompt },
      ],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content
            if (delta) controller.enqueue(encoder.encode(delta))
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `OpenAI 요청 실패: ${message}` }, { status: 500 })
  }
}
