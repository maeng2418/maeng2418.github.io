import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Comments from '@/components/Comments'
import { PostEditEntry } from '@/components/PostEditEntry'
import BlogBackdrop from '@/components/blog/BlogBackdrop'
import BackToTop from '@/components/post/BackToTop'
import CodeBlocks from '@/components/post/CodeBlocks'
import PostFooter, { type NavPost } from '@/components/post/PostFooter'
import PostHeader from '@/components/post/PostHeader'
import ReadingProgress from '@/components/post/ReadingProgress'
import Toc from '@/components/post/Toc'
import { IS_SERVER_TARGET } from '@/build-target'
import { getAdjacentPosts, getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/content/loader'
import type { PostMeta } from '@/lib/content/types'
import { SITE_URL } from '@/lib/site'
import 'katex/dist/katex.min.css'

// 포스트 상세 (`/posts/[...slug]`) — REQ-BLOG-004
// generateStaticParams 전면 적용 — output: 'export' 정적 산출 (REQ-BLOG-008)
// 레이아웃: 본문 720px + sticky 목차 / 진행 바 / 코드 복사 / 공유 / 이전·다음 / 이어서 읽기 / 댓글

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

function toNavPost(p: PostMeta): NavPost {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    dateFormatted: p.dateFormatted,
    category: p.category,
    readingMinutes: p.readingMinutes,
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const { prev, next } = getAdjacentPosts(post.slug)
  // 이전/다음에 이미 보이는 글은 이어서 읽기에서 제외
  const related = getRelatedPosts(post.slug, 2, [prev?.slug, next?.slug].filter((s): s is string => !!s))

  return (
    <>
      <ReadingProgress />
      <article className="relative py-14 md:py-16">
        <BlogBackdrop />
        <PostHeader
          category={post.category}
          title={post.title}
          excerpt={post.excerpt}
          dateFormatted={post.dateFormatted}
          readingMinutes={post.readingMinutes}
          charCount={post.charCount}
          thumbnail={post.thumbnail}
        />
        {/* 수정 진입점 — 서버 타깃 빌드에서만 렌더된다 (design.md §B D9, REQ-EDIT-001/002) */}
        {IS_SERVER_TARGET && <PostEditEntry path={post.slug} />}

        <div className="post-layout">
          <div className="post-art">
            <div
              className="prose border-t border-line pt-9"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
            <CodeBlocks />
            <PostFooter
              url={`${SITE_URL}/posts/${post.slug}/`}
              title={post.title}
              category={post.category}
              prev={prev ? toNavPost(prev) : null}
              next={next ? toNavPost(next) : null}
              related={related.map(toNavPost)}
              // giscus 댓글 — env(NEXT_PUBLIC_GISCUS_*) 4값 존재 시에만 렌더 (REQ-ENH-006)
              comments={<Comments />}
            />
          </div>
          <Toc headings={post.headings} />
        </div>
      </article>
      <BackToTop />
    </>
  )
}
