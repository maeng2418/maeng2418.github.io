'use client'

// 목록 — 시안 M1 스포트라이트 그리드 (REQ-BLOG-003)
// - 세그먼트 탭: 선택 항목 아래로 미끄러지는 인디케이터(측정값을 CSS 변수로), button + aria-pressed
// - 카드 그리드 3열, 첫 카드(최신)는 2×2. 커서 위치를 카드별 CSS 변수(--x/--y)로 흘려
//   테두리 글로우(::before)와 내부 광(::after)을 그린다 — 리렌더 없음, 포인터 이벤트 1개 위임
// - 등장 모션: motion whileInView fade-up (REQ-ENH-008), 카드 순서대로 짧게 지연
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ALL_CATEGORY, countByCategory, filterByCategory } from '@/lib/content/list'
import { coverFor } from '@/lib/content/cover'
import { trackSpotlight } from '@/components/blog/spotlight'

export interface CardPost {
  slug: string
  title: string
  dateFormatted: string
  category: string
  thumbnail: string | null
  excerpt: string
  readingMinutes: number
}

const MotionLink = motion.create(Link)
const REVEAL_EASE = [0.25, 0.1, 0.25, 1] as const

export default function PostList({
  posts,
  categories,
}: {
  posts: CardPost[]
  categories: string[]
}) {
  const t = useTranslations('blog')
  const [selected, setSelected] = useState<string>(ALL_CATEGORY)
  const segRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const counts = countByCategory(posts)
  const filtered = filterByCategory(posts, selected)

  // 선택 탭의 위치/너비를 세그먼트 컨테이너의 CSS 변수로 — 인디케이터가 CSS transition 으로 미끄러진다
  useLayoutEffect(() => {
    const seg = segRef.current
    const on = seg?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
    if (!seg || !on) return
    seg.style.setProperty('--sx', `${on.offsetLeft}px`)
    seg.style.setProperty('--sw', `${on.offsetWidth}px`)
  }, [selected, categories])

  return (
    <section aria-label={t('listAria')} className="relative flex flex-col gap-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <div ref={segRef} role="group" aria-label={t('filterAria')} className="spot-seg">
          {categories.map((category) => {
            const active = category === selected
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(category)}
                className={active ? 'is-on' : ''}
              >
                {category === ALL_CATEGORY ? t('all') : category}
                <b>{counts[category] ?? 0}</b>
              </button>
            )
          })}
        </div>
        <span className="font-mono text-[13px] text-ink-faint">
          {t('sorted', { count: filtered.length })}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-ink-faint">{t('empty')}</p>
      ) : (
        <div className="spot-grid" onPointerMove={trackSpotlight}>
          {filtered.map((post, index) => {
            const cover = coverFor(post.category)
            const featured = index === 0
            return (
              <MotionLink
                key={post.slug}
                href={`/posts/${post.slug}/`}
                initial={reduced ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: 0.7, ease: REVEAL_EASE, delay: Math.min(index, 8) * 0.045 }}
                className={`spot-card ${featured ? 'is-feat' : ''}`}
                style={{ '--c1': cover.c1, '--c2': cover.c2 } as React.CSSProperties}
              >
                <div className="spot-cover">
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt="" loading={featured ? 'eager' : 'lazy'} />
                  ) : (
                    <span className="spot-mark" aria-hidden="true">
                      {cover.mark}
                    </span>
                  )}
                </div>
                <div className="spot-body">
                  <span className="spot-tag">
                    <i />
                    {post.category}
                  </span>
                  <span className="spot-title">{post.title}</span>
                  <span className="spot-excerpt">{post.excerpt}</span>
                  <span className="spot-meta">
                    <span className="font-mono">{post.dateFormatted}</span>
                    <span>{t('readMinutes', { count: post.readingMinutes })}</span>
                  </span>
                </div>
              </MotionLink>
            )
          })}
        </div>
      )}
    </section>
  )
}
