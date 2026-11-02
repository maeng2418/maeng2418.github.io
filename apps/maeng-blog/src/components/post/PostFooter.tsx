'use client'

// 글 끝 — 공유 행 / 이전·다음 / 이어서 읽기(스포트라이트 글로우 카드) / 댓글(슬롯) / 목록으로
import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { trackSpotlight } from '@/components/blog/spotlight'
import { coverFor } from '@/lib/content/cover'

export interface NavPost {
  slug: string
  title: string
  excerpt: string
  dateFormatted: string
  category: string
  readingMinutes: number
}

const COPIED_MS = 1600

function coverVars(category: string): React.CSSProperties {
  const c = coverFor(category)
  return { '--c1': c.c1, '--c2': c.c2 } as React.CSSProperties
}

export default function PostFooter({
  url,
  title,
  category,
  prev,
  next,
  related,
  comments,
}: {
  url: string
  title: string
  category: string
  prev: NavPost | null
  next: NavPost | null
  related: NavPost[]
  comments?: ReactNode
}) {
  const t = useTranslations('post')
  const tb = useTranslations('blog')
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), COPIED_MS)
    } catch {
      // 클립보드 권한 거부 — 라벨 유지
    }
  }
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  const sameCategory = related.length > 0 && related.every((p) => p.category === category)

  return (
    <>
      <div className="mt-14 flex flex-wrap items-center justify-between gap-3.5 border-t border-line pt-7">
        <span className="text-sm text-ink-soft">{t('sharePrompt')}</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copyLink} className="site-ib">
            {copied ? t('linkCopied') : t('copyLink')}
          </button>
          <a href={xHref} target="_blank" rel="noreferrer" className="site-ib">
            {t('shareX')}
          </a>
          <a href="/rss.xml" className="site-ib">
            {t('rss')}
          </a>
        </div>
      </div>

      <nav
        aria-label={`${t('prev')} / ${t('next')}`}
        className="mt-7 grid gap-3.5 sm:grid-cols-2"
        onPointerMove={trackSpotlight}
      >
        {prev ? (
          <Link href={`/posts/${prev.slug}/`} className="spot-card is-sm" style={coverVars(prev.category)}>
            <div className="spot-cover" />
            <div className="spot-body">
              <span className="spot-label">{t('prev')}</span>
              <span className="spot-title">{prev.title}</span>
              <span className="spot-meta">
                <span className="font-mono">{prev.dateFormatted}</span>
                <span>{prev.category}</span>
              </span>
            </div>
          </Link>
        ) : (
          <div className="spot-card is-sm is-empty">
            <div className="spot-cover" />
            <div className="spot-body items-end text-right">
              <span className="spot-label">{t('prev')}</span>
              <span className="spot-title text-ink-faint">{t('oldest')}</span>
            </div>
          </div>
        )}
        {next ? (
          <Link href={`/posts/${next.slug}/`} className="spot-card is-sm" style={coverVars(next.category)}>
            <div className="spot-cover" />
            <div className="spot-body items-end text-right">
              <span className="spot-label">{t('next')}</span>
              <span className="spot-title">{next.title}</span>
              <span className="spot-meta">
                <span>{next.category}</span>
                <span className="font-mono">{next.dateFormatted}</span>
              </span>
            </div>
          </Link>
        ) : (
          <div className="spot-card is-sm is-empty">
            <div className="spot-cover" />
            <div className="spot-body items-end text-right">
              <span className="spot-label">{t('next')}</span>
              <span className="spot-title text-ink-faint">{t('newest')}</span>
            </div>
          </div>
        )}
      </nav>

      {related.length > 0 && (
        <section className="mt-12 flex flex-col gap-3.5">
          <h2 className="text-[15px] font-semibold">
            {sameCategory ? (
              <>
                {t('relatedSame')} <span className="font-normal text-ink-faint">· {category}</span>
              </>
            ) : (
              t('relatedMore')
            )}
          </h2>
          <div className="grid gap-3.5 sm:grid-cols-2" onPointerMove={trackSpotlight}>
            {related.map((p) => (
              <Link key={p.slug} href={`/posts/${p.slug}/`} className="spot-card is-sm" style={coverVars(p.category)}>
                <div className="spot-cover" />
                <div className="spot-body">
                  <span className="spot-tag">
                    <i />
                    {p.category}
                  </span>
                  <span className="spot-title">{p.title}</span>
                  <span className="spot-excerpt">{p.excerpt}</span>
                  <span className="spot-meta">
                    <span className="font-mono">{p.dateFormatted}</span>
                    <span>{tb('readMinutes', { count: p.readingMinutes })}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {comments}

      <nav className="mt-12 border-t border-line pt-6">
        <Link href="/" className="font-semibold text-accent no-underline hover:underline">
          {t('backToList')}
        </Link>
      </nav>
    </>
  )
}
