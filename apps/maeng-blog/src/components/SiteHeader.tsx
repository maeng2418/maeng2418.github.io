'use client'

// 전역 헤더 내비게이션 — UI 크롬 문자열을 next-intl 카탈로그에서 공급 (REQ-ENH-002/003)
// 검색 진입점(pagefind) 포함 — REQ-ENH-005 (ENHANCE-005 M5)
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Search from '@/components/search/Search'

export default function SiteHeader() {
  const t = useTranslations('nav')

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-ink no-underline">
          MAENG<span className="text-accent">.</span>
        </Link>
        <nav aria-label={t('menuAria')} className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-ink-soft hover:text-accent">
            {t('blog')}
          </Link>
          <Link href="/til/" className="text-ink-soft hover:text-accent">
            {t('til')}
          </Link>
          <Link href="/portfolio/" className="text-ink-soft hover:text-accent">
            {t('portfolio')}
          </Link>
          <Search />
        </nav>
      </div>
    </header>
  )
}
