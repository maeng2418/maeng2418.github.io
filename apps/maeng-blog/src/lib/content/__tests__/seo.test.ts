// AC-BLOG-011 — SEO 기본기: sitemap/robots 정적 산출 + draft 제외 + canonical 규약
import { describe, expect, it } from 'vitest'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import { getAllPosts } from '@/lib/content/loader'
import { SITE_URL } from '@/lib/site'

describe('sitemap (REQ-BLOG-011)', () => {
  const entries = sitemap()
  const urls = entries.map((e) => e.url)

  it('공개 라우트(홈/TIL/포트폴리오)를 SITE_URL 기준 절대 URL 로 포함한다', () => {
    expect(urls).toContain(`${SITE_URL}/`)
    expect(urls).toContain(`${SITE_URL}/til/`)
    expect(urls).toContain(`${SITE_URL}/portfolio/`)
  })

  it('비-draft 포스트 전건을 trailingSlash 규칙으로 포함한다', () => {
    for (const post of getAllPosts()) {
      expect(urls).toContain(`${SITE_URL}/posts/${post.slug}/`)
    }
  })

  it('draft 포스트는 어디에도 노출되지 않는다 (§D.2 엣지 케이스)', () => {
    // 픽스처의 draft 포스트 slug 가 sitemap 에 없어야 한다 — getAllPosts() draft 제외 계약 소비
    expect(urls.some((url) => url.includes('draft'))).toBe(false)
    expect(entries).toHaveLength(3 + getAllPosts().length)
  })
})

describe('robots (REQ-BLOG-011)', () => {
  it('전체 허용 + sitemap 절대 URL 을 선언한다', () => {
    const result = robots()
    expect(result.rules).toEqual({ userAgent: '*', allow: '/' })
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`)
  })
})
