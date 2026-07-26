// POST/DELETE /api/auth/session — 세션 발급/로그아웃. 서버 타깃 전용 라우트.
// POST는 미들웨어 예외 대상(공개) — 로그인 자체가 미인증 상태에서 호출된다(design.md §B D2).
// DELETE는 인증 필요(design.md §B D2 표).
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthEnv } from '@/lib/editor-server/env'
import {
  constantTimeEquals,
  deriveSessionCookieValue,
  requireEditorAuth,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  unauthorizedApiResponse,
} from '@/lib/editor-server/auth'

const SessionRequestSchema = z.object({ token: z.string().min(1) })

export async function POST(request: Request): Promise<Response> {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return unauthorizedApiResponse()
  }

  const parsed = SessionRequestSchema.safeParse(payload)
  if (!parsed.success) {
    // 잘못된 토큰과 무토큰의 응답을 동일화한다 — 형식 오류도 401 unauthorized로 처리(열거 방지)
    return unauthorizedApiResponse()
  }

  let authEnv
  try {
    authEnv = getAuthEnv()
  } catch {
    return unauthorizedApiResponse()
  }

  const valid = authEnv.disabled || (await constantTimeEquals(parsed.data.token, authEnv.token))
  if (!valid) {
    return unauthorizedApiResponse()
  }

  const cookieValue = await deriveSessionCookieValue(authEnv.token)
  const secure = new URL(request.url).protocol === 'https:'
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return response
}

export async function DELETE(request: Request): Promise<Response> {
  const denied = await requireEditorAuth(request)
  if (denied) return denied

  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 })
  return response
}
