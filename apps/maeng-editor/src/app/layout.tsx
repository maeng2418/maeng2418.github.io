import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'maeng-editor',
  description: 'maeng.dev 블로그 마크다운 저작 도구 (로컬 전용)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
