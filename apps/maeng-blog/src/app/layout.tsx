import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'
import './globals.css'

// metadataBase — 각 라우트의 alternates.canonical 상대 경로가 SITE_URL 기준 절대 URL 로 해석된다 (REQ-BLOG-011).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MAENG — 기록은 미래의 나를 돕는다',
    template: '%s | MAENG',
  },
  description: '김명성의 개발 블로그 — 프런트엔드, 자바스크립트, 웹 기술 기록.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-5">
            <Link
              href="/"
              className="text-lg font-extrabold tracking-tight text-ink no-underline"
            >
              MAENG<span className="text-accent">.</span>
            </Link>
            <nav aria-label="주 메뉴" className="flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-ink-soft hover:text-accent">
                블로그
              </Link>
              <Link href="/til/" className="text-ink-soft hover:text-accent">
                TIL
              </Link>
              <Link href="/portfolio/" className="text-ink-soft hover:text-accent">
                포트폴리오
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-[1080px] px-6">{children}</main>
        <footer className="mt-24 border-t border-line">
          <div className="mx-auto max-w-[1080px] px-6 py-14 text-[13px] text-ink-faint">
            © {new Date().getFullYear()} Myeongseong Kim. 기록은 미래의 나를 돕는다.
          </div>
        </footer>
      </body>
    </html>
  )
}
