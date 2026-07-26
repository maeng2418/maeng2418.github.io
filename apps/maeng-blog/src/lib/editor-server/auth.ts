// 앱 계층 토큰 인증 게이트 — SPEC-MAENGV2-EDITOR-MERGE-006 M4 (design.md §B D3/D6, REQ-AUTH-001..007)
// 세션 쿠키는 EDITOR_AUTH_TOKEN 원문을 절대 싣지 않는다 — HMAC 파생값만 저장한다(REQ-AUTH-003).
// 비교는 상수 시간으로 수행한다: 고정 길이(32바이트) SHA-256 해시 후 누적 XOR, 조기 반환 금지(REQ-AUTH-004).
import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthEnv, type AuthRuntimeEnv } from './env'

export const SESSION_COOKIE_NAME = 'maeng_editor_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7일 — design.md §B D3

const HMAC_INFO = 'maeng-editor-session-v1'

interface HeaderGetter {
  get(name: string): string | null
}

async function sha256(input: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return new Uint8Array(digest)
}

// @MX:ANCHOR: [AUTO] 인증 토큰 비교의 유일한 지점 — 상수 시간 비교(고정 길이 해시 + 누적 XOR, 조기 반환 없음)
// @MX:REASON: 조기 반환 비교(===)는 타이밍 사이드채널을 유발한다(design.md §B D3, plan.md §G 안티패턴, REQ-AUTH-004)
export async function constantTimeEquals(a: string, b: string): Promise<boolean> {
  const [digestA, digestB] = await Promise.all([sha256(a), sha256(b)])
  let diff = 0
  for (let i = 0; i < digestA.length; i++) {
    diff |= digestA[i] ^ digestB[i]
  }
  return diff === 0
}

async function hmacSessionValue(token: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(token),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(HMAC_INFO))
  return Buffer.from(signature).toString('hex')
}

/** 세션 쿠키 값 파생 — 원문 토큰과 바이트 단위로 달라야 한다(REQ-AUTH-003) */
export async function deriveSessionCookieValue(token: string): Promise<string> {
  return hmacSessionValue(token)
}

async function verifySessionCookie(cookieValue: string, token: string): Promise<boolean> {
  const expected = await hmacSessionValue(token)
  return constantTimeEquals(cookieValue, expected)
}

function extractBearerToken(headerGetter: HeaderGetter): string | undefined {
  const header = headerGetter.get('authorization')
  if (!header) return undefined
  const match = /^Bearer\s+(.+)$/i.exec(header)
  return match?.[1]
}

function extractCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim()
  }
  return undefined
}

/** 내비게이션 요청 판별 — design.md §B D3 거부 응답 규칙(Accept: text/html) */
export function isNavigationRequest(headerGetter: HeaderGetter): boolean {
  const accept = headerGetter.get('accept') ?? ''
  return accept.includes('text/html')
}

async function isAuthenticatedCore(
  bearer: string | undefined,
  cookieValue: string | undefined,
  authEnv: AuthRuntimeEnv
): Promise<boolean> {
  if (authEnv.disabled) return true
  if (bearer !== undefined) return constantTimeEquals(bearer, authEnv.token)
  if (cookieValue !== undefined) return verifySessionCookie(cookieValue, authEnv.token)
  return false
}

// 잘못된 토큰과 무토큰 요청은 동일한 응답을 반환한다 — 열거 방지(E-12, AC-M4-020)
export function unauthorizedApiResponse(): Response {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}

function unauthorizedRedirect(requestUrl: string): Response {
  const url = new URL(requestUrl)
  const next = `${url.pathname}${url.search}`
  const loginUrl = new URL('/editor/login', url.origin)
  loginUrl.searchParams.set('next', next)
  return NextResponse.redirect(loginUrl, { status: 302 })
}

/**
 * [1계층/2계층 공용] Route Handler·미들웨어에서 사용하는 인증 가드.
 * 인증 성공 시 null, 실패 시 302(내비게이션)/401(그 외) Response를 반환한다.
 */
export async function requireEditorAuth(request: Request): Promise<Response | null> {
  let authEnv: AuthRuntimeEnv
  try {
    authEnv = getAuthEnv()
  } catch {
    return isNavigationRequest(request.headers)
      ? unauthorizedRedirect(request.url)
      : unauthorizedApiResponse()
  }

  const bearer = extractBearerToken(request.headers)
  const cookieValue = extractCookieValue(request.headers.get('cookie'), SESSION_COOKIE_NAME)
  const ok = await isAuthenticatedCore(bearer, cookieValue, authEnv)
  if (ok) return null
  return isNavigationRequest(request.headers) ? unauthorizedRedirect(request.url) : unauthorizedApiResponse()
}

/**
 * [2계층] 서버 컴포넌트(page.server.tsx) 전용 인증 가드.
 * 미인증 시 `/editor/login?next=<nextPath>`로 리다이렉트한다(REQ-AUTH-002, REQ-EDIT-005).
 */
export async function requireEditorAuthPage(nextPath: string): Promise<void> {
  const loginPath = `/editor/login?next=${encodeURIComponent(nextPath)}`

  let authEnv: AuthRuntimeEnv
  try {
    authEnv = getAuthEnv()
  } catch {
    redirect(loginPath)
  }

  const hdrs = await headers()
  const cookieStore = await cookies()
  const bearer = extractBearerToken(hdrs)
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const ok = await isAuthenticatedCore(bearer, cookieValue, authEnv)
  if (!ok) redirect(loginPath)
}
