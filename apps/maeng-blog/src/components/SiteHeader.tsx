'use client'

// 전역 헤더 — sticky + 블러, 현재 섹션 밑줄, 검색(⌘K), 테마 토글, 언어 토글.
// UI 크롬 문자열은 next-intl 카탈로그(nav)에서 공급 (REQ-ENH-002/003).
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocaleToggle } from '@/components/i18n/LocaleProvider'
import Search from '@/components/search/Search'
import ThemeToggle from '@/components/ThemeToggle'

const NAV = [
  { href: '/', key: 'blog', isActive: (p: string) => p === '/' || p.startsWith('/posts') },
  { href: '/portfolio/', key: 'portfolio', isActive: (p: string) => p.startsWith('/portfolio') },
] as const

export default function SiteHeader() {
  const t = useTranslations('nav')
  const pathname = usePathname() ?? '/'
  const { locale, toggle } = useLocaleToggle()

  return (
    <header className="site-header sticky top-0 z-30 border-b border-line">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-[-0.02em] text-ink no-underline">
          MAENG<span className="text-accent">.</span>
        </Link>
        <nav aria-label={t('menuAria')} className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={item.isActive(pathname) ? 'page' : undefined}
              className={`site-nl ${item.isActive(pathname) ? 'is-on' : ''}`}
            >
              {t(item.key)}
            </Link>
          ))}
          <Search />
          <ThemeToggle />
          <button type="button" onClick={toggle} aria-label={t('locale')} className="site-ib px-2.5">
            {locale === 'ko' ? 'EN' : 'KO'}
          </button>
        </nav>
      </div>
    </header>
  )
}
