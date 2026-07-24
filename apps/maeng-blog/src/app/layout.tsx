import type { Metadata } from 'next'
import LocaleProvider from '@/components/i18n/LocaleProvider'
import SiteHeader from '@/components/SiteHeader'
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
        <LocaleProvider>
          <SiteHeader />
          <main className="mx-auto max-w-[1080px] px-6">{children}</main>
          <footer className="mt-24 border-t border-line">
            <div className="mx-auto max-w-[1080px] px-6 py-14 text-[13px] text-ink-faint">
              © {new Date().getFullYear()} Myeongseong Kim. 기록은 미래의 나를 돕는다.
            </div>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  )
}
