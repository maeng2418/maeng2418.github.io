import type { Metadata } from 'next'
import PostList, { type CardPost } from '@/components/PostList'
import { getAllPosts } from '@/lib/content/loader'
import { buildCategoryOptions } from '@/lib/content/list'

// 블로그 목록 (`/`) — REQ-BLOG-003
// 서버(빌드타임)에서 콘텐츠를 읽고, 카테고리 필터/등장 모션은 클라이언트 컴포넌트가 담당.

// canonical — REQ-BLOG-011 (layout metadataBase 기준 절대 URL 해석)
export const metadata: Metadata = {
  alternates: { canonical: '/' },
}
export default function HomePage() {
  const posts = getAllPosts()
  const categories = buildCategoryOptions(posts)

  const cards: CardPost[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    dateFormatted: p.dateFormatted,
    category: p.category,
    thumbnail: p.thumbnail,
    excerpt: p.excerpt,
  }))

  return (
    <>
      <section className="pt-20 pb-14 md:pt-28">
        <p className="mb-3 text-xs font-bold tracking-[0.14em] uppercase text-accent">
          Dev Blog
        </p>
        <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-balance md:text-6xl">
          기록은 미래의
          <br />
          나를 돕는다<span className="text-accent">.</span>
        </h1>
        <p className="mt-6 max-w-[62ch] text-lg text-ink-soft">
          프런트엔드와 웹 기술에 대해 배운 것을 기록합니다.
        </p>
      </section>
      <PostList posts={cards} categories={categories} />
    </>
  )
}
