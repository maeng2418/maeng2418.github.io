'use client'

// 목록 카드 + 카테고리 필터 (REQ-BLOG-003)
// - 카테고리 칩: 가로 스크롤, ALL 선두, 키보드 접근 가능(button + aria-pressed)
// - 등장 모션: motion whileInView fade-up (REQ-ENH-008 — 수제 IntersectionObserver 대체)
//   타이밍/트리거는 기존 값 승계: 0.7s ease, y 24px, rootMargin '0px 0px -10% 0px', 1회 트리거.
//   prefers-reduced-motion 은 useReducedMotion 분기 + globals.css 폴백으로 즉시 표시.
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { ALL_CATEGORY, filterByCategory } from '@/lib/content/list'

export interface CardPost {
  slug: string
  title: string
  dateFormatted: string
  category: string
  thumbnail: string | null
  excerpt: string
}

const MotionLink = motion.create(Link)

/** 기존 CSS `.reveal` 트랜지션(0.7s ease) 승계 — 시각 리디자인 금지 (spec §C) */
const REVEAL_EASE = [0.25, 0.1, 0.25, 1] as const

export default function PostList({
  posts,
  categories,
}: {
  posts: CardPost[]
  categories: string[]
}) {
  const [selected, setSelected] = useState<string>(ALL_CATEGORY)
  const reduced = useReducedMotion()
  const filtered = filterByCategory(posts, selected)

  return (
    <section aria-label="블로그 포스트 목록">
      <div
        role="group"
        aria-label="카테고리 필터"
        className="flex gap-2 overflow-x-auto border-y border-line py-4"
      >
        {categories.map((category) => {
          const active = category === selected
          return (
            <button
              key={category}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(category)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-bold tracking-[0.06em] uppercase transition-colors ${
                active
                  ? 'bg-accent text-paper'
                  : 'bg-accent-soft text-accent hover:bg-accent hover:text-paper'
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-ink-faint">
          이 카테고리에는 아직 글이 없어요.
        </p>
      ) : (
        <div className="grid gap-5 py-10 md:grid-cols-2">
          {filtered.map((post) => (
            <MotionLink
              key={post.slug}
              href={`/posts/${post.slug}/`}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.7, ease: REVEAL_EASE }}
              className="group overflow-hidden rounded-lg border border-line bg-card no-underline transition-colors hover:border-accent"
            >
              {/* 썸네일(있을 때) — design.md §3.1 / REQ-BLOG-003. 없으면 텍스트 카드 (§D.2 placeholder 처리) */}
              {post.thumbnail && (
                <img
                  src={post.thumbnail}
                  alt=""
                  loading="lazy"
                  className="aspect-[2/1] w-full border-b border-line object-cover"
                />
              )}
              <div className="p-6">
                <span className="inline-block rounded-full bg-accent-soft px-3 py-0.5 text-[11px] font-bold tracking-[0.06em] uppercase text-accent">
                  {post.category}
                </span>
                <h2 className="mt-3 text-xl font-bold tracking-[-0.015em] text-ink group-hover:text-accent">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{post.excerpt}</p>
                <p className="mt-4 text-[13px] font-semibold tracking-[0.08em] uppercase text-ink-faint">
                  {post.dateFormatted}
                </p>
              </div>
            </MotionLink>
          ))}
        </div>
      )}
    </section>
  )
}
