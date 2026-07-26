// 인증 게이트 단위 테스트 — SPEC-MAENGV2-EDITOR-MERGE-006 M4 (REQ-AUTH-001..007)
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  constantTimeEquals,
  deriveSessionCookieValue,
  isNavigationRequest,
  requireEditorAuth,
  SESSION_COOKIE_NAME,
  unauthorizedApiResponse,
} from '@/lib/editor-server/auth'

const TOKEN = 'x'.repeat(32)

function clearAuthEnv() {
  delete process.env.EDITOR_AUTH_TOKEN
  delete process.env.EDITOR_AUTH_DISABLED
}

beforeEach(() => {
  clearAuthEnv()
  process.env.EDITOR_AUTH_TOKEN = TOKEN
})

afterEach(clearAuthEnv)

describe('constantTimeEquals (REQ-AUTH-004)', () => {
  it('동일한 값은 true 를 반환한다', async () => {
    expect(await constantTimeEquals(TOKEN, TOKEN)).toBe(true)
  })

  it('길이가 다른 값도 거부한다', async () => {
    expect(await constantTimeEquals(TOKEN, TOKEN.slice(0, -1))).toBe(false)
  })

  it('1바이트만 다른 값도 거부한다', async () => {
    const almost = `${TOKEN.slice(0, -1)}y`
    expect(await constantTimeEquals(TOKEN, almost)).toBe(false)
  })
})

describe('auth.ts 소스 — 조기 반환 비교 구조 부재 (AC-M4-014 구조적 grep 보완)', () => {
  it('토큰을 ===/!== 로 직접 비교하지 않는다 (누적 XOR + 고정 길이 해시만 사용)', () => {
    const here = path.dirname(fileURLToPath(import.meta.url))
    const source = readFileSync(path.join(here, '..', 'auth.ts'), 'utf8')
    // "diff === 0" 은 누적 XOR 결과를 0과 비교하는 허용된 패턴이다 — 토큰 직접 비교가 아니다.
    const forbidden = /\b(bearer|cookieValue|token|a|b)\s*(===|!==)\s*(bearer|cookieValue|token|a|b)\b/
    expect(forbidden.test(source)).toBe(false)
  })
})

describe('deriveSessionCookieValue (REQ-AUTH-003)', () => {
  it('원문 토큰과 바이트 단위로 다르다', async () => {
    const cookieValue = await deriveSessionCookieValue(TOKEN)
    expect(cookieValue).not.toBe(TOKEN)
    expect(cookieValue).not.toContain(TOKEN)
  })

  it('동일 토큰은 항상 동일한 파생값을 반환한다 (결정적)', async () => {
    const a = await deriveSessionCookieValue(TOKEN)
    const b = await deriveSessionCookieValue(TOKEN)
    expect(a).toBe(b)
  })
})

describe('isNavigationRequest', () => {
  it('Accept: text/html 요청을 내비게이션으로 판정한다', () => {
    const headers = new Headers({ accept: 'text/html' })
    expect(isNavigationRequest(headers)).toBe(true)
  })

  it('Accept 헤더가 없거나 json 인 경우 내비게이션이 아니다', () => {
    expect(isNavigationRequest(new Headers())).toBe(false)
    expect(isNavigationRequest(new Headers({ accept: 'application/json' }))).toBe(false)
  })
})

describe('requireEditorAuth — Bearer 토큰 경로', () => {
  it('유효한 토큰은 통과시킨다 (null 반환)', async () => {
    const request = new Request('http://localhost/api/posts', {
      headers: { authorization: `Bearer ${TOKEN}` },
    })
    expect(await requireEditorAuth(request)).toBeNull()
  })

  it('잘못된 토큰은 401 을 반환한다', async () => {
    const request = new Request('http://localhost/api/posts', {
      headers: { authorization: 'Bearer wrong-token' },
    })
    const response = await requireEditorAuth(request)
    expect(response?.status).toBe(401)
  })
})

describe('requireEditorAuth — 열거 방지 (AC-M4-020)', () => {
  it('잘못된 토큰과 무토큰 응답이 상태코드·본문 모두 동일하다', async () => {
    const wrong = await requireEditorAuth(
      new Request('http://localhost/api/posts', { headers: { authorization: 'Bearer wrong' } })
    )
    const none = await requireEditorAuth(new Request('http://localhost/api/posts'))
    expect(wrong?.status).toBe(none?.status)
    expect(await wrong?.clone().text()).toBe(await none?.clone().text())
  })
})

describe('requireEditorAuth — 응답 판정 (302 내비게이션 / 401 API)', () => {
  it('Accept: text/html 미인증 요청은 302 + Location 에 /editor/login 을 포함한다', async () => {
    const request = new Request('http://localhost/editor', { headers: { accept: 'text/html' } })
    const response = await requireEditorAuth(request)
    expect(response?.status).toBe(302)
    expect(response?.headers.get('location')).toContain('/editor/login')
  })

  it('그 외 미인증 요청은 401 을 반환한다', async () => {
    const response = await requireEditorAuth(new Request('http://localhost/api/posts'))
    expect(response?.status).toBe(401)
  })
})

describe('requireEditorAuth — 변조 세션 쿠키 (AC-M4-021, E-11)', () => {
  it('변조 쿠키는 5xx 없이 401/302 로 처리된다', async () => {
    const apiResponse = await requireEditorAuth(
      new Request('http://localhost/api/posts', { headers: { cookie: `${SESSION_COOKIE_NAME}=deadbeef` } })
    )
    expect(apiResponse?.status).toBe(401)

    const navResponse = await requireEditorAuth(
      new Request('http://localhost/editor', {
        headers: { accept: 'text/html', cookie: `${SESSION_COOKIE_NAME}=deadbeef` },
      })
    )
    expect(navResponse?.status).toBe(302)
  })

  it('올바르게 파생된 세션 쿠키는 통과시킨다', async () => {
    const cookieValue = await deriveSessionCookieValue(TOKEN)
    const response = await requireEditorAuth(
      new Request('http://localhost/api/posts', { headers: { cookie: `${SESSION_COOKIE_NAME}=${cookieValue}` } })
    )
    expect(response).toBeNull()
  })
})

describe('requireEditorAuth — EDITOR_AUTH_DISABLED 로컬 우회 (REQ-AUTH-006)', () => {
  it('EDITOR_AUTH_DISABLED=1 이면 토큰 없이도 통과한다', async () => {
    process.env.EDITOR_AUTH_DISABLED = '1'
    const response = await requireEditorAuth(new Request('http://localhost/api/posts'))
    expect(response).toBeNull()
  })

  it('EDITOR_AUTH_TOKEN 이 없으면 우회 플래그와 무관하게 거부한다', async () => {
    clearAuthEnv()
    process.env.EDITOR_AUTH_DISABLED = '1'
    const response = await requireEditorAuth(new Request('http://localhost/api/posts'))
    expect(response?.status).toBe(401)
  })
})

describe('unauthorizedApiResponse', () => {
  it('원문 토큰을 포함하지 않는다', async () => {
    const response = unauthorizedApiResponse()
    const body = await response.text()
    expect(body).not.toContain(TOKEN)
  })
})
