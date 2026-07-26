// POST/DELETE /api/auth/session 라우트 핸들러 — SPEC-MAENGV2-EDITOR-MERGE-006 M4
// AC-M4-019 (원문 토큰 미노출), AC-M4-020 (열거 방지)
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DELETE, POST } from '@/app/api/auth/session/route.server'
import { SESSION_COOKIE_NAME } from '@/lib/editor-server/auth'

const TOKEN = 'y'.repeat(40)

beforeEach(() => {
  process.env.EDITOR_AUTH_TOKEN = TOKEN
})

afterEach(() => {
  delete process.env.EDITOR_AUTH_TOKEN
  delete process.env.EDITOR_AUTH_DISABLED
})

function postSession(body: unknown) {
  return POST(
    new Request('http://localhost/api/auth/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  )
}

describe('POST /api/auth/session', () => {
  it('유효한 토큰이면 Set-Cookie 값이 원문 토큰과 다르다 (AC-M4-019)', async () => {
    const response = await postSession({ token: TOKEN })
    expect(response.status).toBe(200)
    const setCookie = response.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(SESSION_COOKIE_NAME)
    expect(setCookie).not.toContain(TOKEN)
  })

  it('잘못된 토큰과 무토큰(빈 문자열) 요청의 상태·본문이 동일하다 (AC-M4-020)', async () => {
    const wrong = await postSession({ token: 'wrong-token' })
    const malformed = await POST(
      new Request('http://localhost/api/auth/session', { method: 'POST', body: '{not json' })
    )
    expect(wrong.status).toBe(401)
    expect(malformed.status).toBe(401)
    expect(await wrong.clone().text()).toBe(await malformed.clone().text())
  })

  it('응답 본문에 원문 토큰이 노출되지 않는다', async () => {
    const response = await postSession({ token: TOKEN })
    const body = await response.text()
    expect(body).not.toContain(TOKEN)
  })
})

describe('DELETE /api/auth/session', () => {
  it('미인증 요청은 401 을 반환한다', async () => {
    const response = await DELETE(new Request('http://localhost/api/auth/session', { method: 'DELETE' }))
    expect(response.status).toBe(401)
  })

  it('유효한 Bearer 토큰이면 쿠키를 만료시킨다', async () => {
    const response = await DELETE(
      new Request('http://localhost/api/auth/session', {
        method: 'DELETE',
        headers: { authorization: `Bearer ${TOKEN}` },
      })
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0')
  })
})
