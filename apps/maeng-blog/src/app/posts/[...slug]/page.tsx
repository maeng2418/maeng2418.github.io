import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug } from '@/lib/content/loader'
import 'katex/dist/katex.min.css'

// 포스트 상세 (`/posts/[...slug]`) — REQ-BLOG-004
// generateStaticParams 전면 적용 — output: 'export' 정적 산출 (REQ-BLOG-008)

export const dynamicParams = false

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slugParts }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/posts/${post.slug}/` }, // REQ-BLOG-011
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date.toISOString(),
      ...(post.thumbnail ? { images: [{ url: post.thumbnail }] } : {}),
    },
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-[720px] py-16 md:py-24">
      <header>
        <span className="inline-block rounded-full bg-accent-soft px-3 py-0.5 text-[11px] font-bold tracking-[0.06em] uppercase text-accent">
          {post.category}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-balance md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-[13px] font-semibold tracking-[0.08em] uppercase text-ink-faint">
          {post.dateFormatted}
        </p>
      </header>

      <div
        className="prose mt-12 border-t border-line pt-10"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <nav className="mt-16 border-t border-line pt-8">
        <Link href="/" className="font-semibold text-accent no-underline hover:underline">
          ← 목록으로 돌아가기
        </Link>
      </nav>
    </article>
  )
}
