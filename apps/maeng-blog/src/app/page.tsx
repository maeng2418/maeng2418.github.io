import type { Metadata } from 'next'
import BlogBackdrop from '@/components/blog/BlogBackdrop'
import BlogHero from '@/components/blog/BlogHero'
import PostList, { type CardPost } from '@/components/PostList'
import { getAllPosts } from '@/lib/content/loader'
import { ALL_CATEGORY, buildCategoryOptions } from '@/lib/content/list'

// 블로그 목록 (`/`) — REQ-BLOG-003, 시안 M1 스포트라이트 그리드
// 서버(빌드타임)에서 콘텐츠를 읽고, 히어로 모션/필터/글로우는 클라이언트 컴포넌트가 담당.

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
    readingMinutes: p.readingMinutes,
  }))
  const years = posts.map((p) => p.date.getFullYear())
  const now = new Date().getFullYear()
  const latest = posts[0]?.date ?? new Date()
  const latestMonth = `${latest.getFullYear()}. ${String(latest.getMonth() + 1).padStart(2, '0')}`

  return (
    <div className="relative">
      <BlogBackdrop />
      <BlogHero
        postCount={cards.length}
        categoryCount={categories.filter((c) => c !== ALL_CATEGORY).length}
        yearFrom={years.length ? Math.min(...years) : now}
        yearTo={years.length ? Math.max(...years) : now}
        latestMonth={latestMonth}
      />
      <PostList posts={cards} categories={categories} />
    </div>
  )
}
