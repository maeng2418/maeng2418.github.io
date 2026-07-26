import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from '@/components/editor/LoginForm'

// SPEC-MAENGV2-EDITOR-MERGE-006 M4 — 서버 타깃 전용 라우트(design.md §B D1 pageExtensions 분기).
// 미들웨어 예외 대상(공개) — 그렇지 않으면 로그인 리다이렉트 루프가 발생한다(src/middleware.server.ts).
export const metadata: Metadata = {
  title: 'maeng-blog editor — login',
}

export default function EditorLoginPage() {
  return (
    <main data-editor-login-shell>
      <h1>maeng-blog editor</h1>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
