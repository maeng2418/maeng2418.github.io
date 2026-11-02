'use client'

// 상세 헤더 — 시안 M1: 브레드크럼 / 커버 히어로(16:7) / 카테고리 태그 / 그라디언트 제목 / 리드 / pill 메타
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { coverFor } from '@/lib/content/cover'

export default function PostHeader({
  category,
  title,
  excerpt,
  dateFormatted,
  readingMinutes,
  charCount,
  thumbnail,
}: {
  category: string
  title: string
  excerpt: string
  dateFormatted: string
  readingMinutes: number
  charCount: number
  thumbnail: string | null
}) {
  const t = useTranslations('post')
  const tb = useTranslations('blog')
  const cover = coverFor(category)
  return (
    <>
      <nav aria-label="breadcrumb" className="mb-6 flex gap-2 font-mono text-[13px] text-ink-faint">
        <Link href="/" className="text-ink-faint">
          {t('home')}
        </Link>
        <span>/</span>
        <span>{category}</span>
      </nav>
      <div
        className="spot-cover post-hero mb-9"
        style={{ '--c1': cover.c1, '--c2': cover.c2 } as React.CSSProperties}
      >
        {thumbnail ? (
          <img src={thumbnail} alt="" />
        ) : (
          <span className="spot-mark" aria-hidden="true">
            {cover.mark}
          </span>
        )}
      </div>
      <header className="mb-11 flex max-w-[800px] flex-col gap-4">
        <span className="spot-tag" style={{ '--c1': cover.c1 } as React.CSSProperties}>
          <i />
          {category}
        </span>
        <h1 className="spot-h1 text-[34px] leading-[1.15] tracking-[-0.04em] text-balance md:text-[52px] md:leading-[1.12]">
          {title}
        </h1>
        {excerpt && <p className="text-lg leading-[1.7] text-ink-soft">{excerpt}</p>}
        <div className="flex flex-wrap gap-2">
          <span className="post-pill">
            <i />
            {dateFormatted}
          </span>
          <span className="post-pill">{tb('readMinutes', { count: readingMinutes })}</span>
          <span className="post-pill">{tb('chars', { count: charCount })}</span>
        </div>
      </header>
    </>
  )
}
