// AC-ENH-007 — RSS 생성 스크립트: 비-draft만, date 내림차순, RSS 2.0 (REQ-ENH-007)
// 로더 픽스처(content/) 를 재사용해 draft 제외 계약을 검증한다 (draft-post.md 1건 포함).
import path from 'node:path'
import { describe, expect, it } from 'vitest'
// @ts-expect-error — 빌드 스크립트(.mjs) 는 타입 선언이 없다 (동작 계약만 검증)
import { buildRss, collectPosts, readSiteUrl } from '../generate-rss.mjs'

const FIXTURE_CONTENT = path.resolve(
  __dirname,
  '../../src/lib/content/__tests__/fixtures/content'
)

describe('generate-rss (빌드 후처리)', () => {
  it('draft 포스트는 수집에서 제외되고 date 내림차순으로 정렬된다', () => {
    const posts = collectPosts(FIXTURE_CONTENT)
    const slugs = posts.map((p: { slug: string }) => p.slug)
    expect(slugs).not.toContain('development/draft-post')
    const times = posts.map((p: { date: Date }) => p.date.getTime())
    expect(times).toEqual([...times].sort((a, b) => b - a))
    expect(posts.length).toBeGreaterThan(0)
  })

  it('RSS 2.0 XML 을 생성한다 — 포스트당 <item> 1건 + trailingSlash 절대 URL', () => {
    const posts = collectPosts(FIXTURE_CONTENT)
    const xml = buildRss(posts, 'https://example.com')
    expect(xml).toContain('<rss version="2.0"')
    expect((xml.match(/<item>/g) ?? []).length).toBe(posts.length)
    expect(xml).toContain(`https://example.com/posts/${posts[0].slug}/`)
  })

  it('SITE_URL 은 src/lib/site.ts 단일 상수를 재사용한다', () => {
    expect(readSiteUrl()).toBe('https://maeng2418.github.io')
  })
})
