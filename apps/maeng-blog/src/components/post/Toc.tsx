'use client'

// 사이드 — 카드형 목차(h2/h3 + IntersectionObserver 스크롤스파이) + 저자 카드. 넓은 화면 sticky, 좁은 화면은 칩 행.
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Heading } from '@/lib/content/headings'

export default function Toc({ headings }: { headings: Heading[] }) {
  const t = useTranslations('post')
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null)

  useEffect(() => {
    const targets = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null)
    if (targets.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  return (
    <aside className="post-side">
      {headings.length > 0 && (
        <nav aria-label={t('toc')} className="post-toc">
          <span className="post-toc-title">{t('toc')}</span>
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              aria-current={active === h.id ? 'location' : undefined}
              className={`post-toc-link ${h.depth === 3 ? 'is-h3' : ''} ${active === h.id ? 'is-on' : ''}`}
            >
              {h.text}
            </a>
          ))}
        </nav>
      )}
      <div className="post-me">
        <span className="font-semibold">김명성</span>
        <span className="leading-[1.5] text-ink-soft">{t('author')}</span>
        <Link href="/portfolio/" className="text-accent">
          {t('portfolio')}
        </Link>
      </div>
    </aside>
  )
}
