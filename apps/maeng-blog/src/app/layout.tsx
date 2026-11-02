import type { Metadata } from 'next'
import LocaleProvider from '@/components/i18n/LocaleProvider'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { THEME_INIT_SCRIPT } from '@/lib/theme'
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
        {/* 저장 테마를 첫 페인트 전에 반영 — 깜빡임 방지 (lib/theme.ts 계약) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <LocaleProvider>
          <SiteHeader />
          <main className="mx-auto max-w-[1080px] px-6">{children}</main>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  )
}
