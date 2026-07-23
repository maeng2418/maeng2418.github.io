import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/content/loader'
import { SITE_URL } from '@/lib/site'

// sitemap — REQ-BLOG-011, AC-BLOG-011
// output: 'export' 호환을 위해 force-static 고정 (빌드타임 정적 산출, REQ-BLOG-008).
// draft 포스트는 getAllPosts() 가 이미 제외한다 (REQ-BLOG-002 — §D.2 엣지 케이스).
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const latest = posts[0]?.date

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: latest, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/til/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/portfolio/`, changeFrequency: 'monthly', priority: 0.8 },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}/`,
    lastModified: post.date,
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...postRoutes]
}
