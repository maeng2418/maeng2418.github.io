'use client'

// 전역 푸터 — 저작권 + RSS / GitHub / 포트폴리오 / 메일 링크
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function SiteFooter() {
  const t = useTranslations('nav')
  const tp = useTranslations('post')
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-[1080px] flex-wrap justify-between gap-4 px-6 py-12 text-[13px] text-ink-faint">
        <span>© {new Date().getFullYear()} Myeongseong Kim. 기록은 미래의 나를 돕는다.</span>
        <span className="flex gap-4">
          <a href="/rss.xml">{tp('rss')}</a>
          <a href="https://github.com/maeng2418">GitHub</a>
          <Link href="/portfolio/">{t('portfolio')}</Link>
          <a href="mailto:maeng2418@gmail.com">{t('mail')}</a>
        </span>
      </div>
    </footer>
  )
}
