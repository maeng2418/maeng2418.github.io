'use client'

// 로그인 폼 — SPEC-MAENGV2-EDITOR-MERGE-006 M4 (design.md §B D3 브라우저 경로)
// 토큰을 POST /api/auth/session 으로 제출하고, 세션 쿠키 발급 성공 시 next 경로로 이동한다.
import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/editor'
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!response.ok) {
        setError('토큰이 올바르지 않습니다')
        return
      }
      router.push(next)
      router.refresh()
    } catch {
      setError('로그인 요청에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-editor-login-form>
      <label htmlFor="editor-auth-token">인증 토큰</label>
      <input
        id="editor-auth-token"
        name="token"
        type="password"
        autoComplete="off"
        required
        value={token}
        onChange={(event) => setToken(event.target.value)}
      />
      {error ? (
        <p role="alert" data-editor-login-error>
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={submitting}>
        로그인
      </button>
    </form>
  )
}
