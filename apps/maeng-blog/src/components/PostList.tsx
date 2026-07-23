'use client'

// 목록 카드 + 카테고리 필터 (REQ-BLOG-003)
// - 카테고리 칩: 가로 스크롤, ALL 선두, 키보드 접근 가능(button + aria-pressed)
// - 등장 모션: IntersectionObserver fade-up — reduced-motion 은 globals.css 에서 비활성
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ALL_CATEGORY, filterByCategory } from '@/lib/content/list'

export interface CardPost {
  slug: string
  title: string
  dateFormatted: string
  category: string
  thumbnail: string | null
  excerpt: string
}

export default function PostList({
  posts,
  categories,
}: {
  posts: CardPost[]
  categories: string[]
}) {
  const [selected, setSelected] = useState<string>(ALL_CATEGORY)
  const listRef = useRef<HTMLDivElement>(null)
  const filtered = filterByCategory(posts, selected)

  useEffect(() => {
    const root = listRef.current
    if (!root) return
    const targets = root.querySelectorAll<HTMLElement>('.reveal:not(.in)')
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [selected])

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
        <div ref={listRef} className="grid gap-5 py-10 md:grid-cols-2">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}/`}
              className="reveal group overflow-hidden rounded-lg border border-line bg-card no-underline transition-colors hover:border-accent"
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
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
