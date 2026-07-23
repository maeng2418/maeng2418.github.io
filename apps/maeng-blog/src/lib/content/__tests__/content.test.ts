// AC-BLOG-002a — 콘텐츠 계층: frontmatter/draft/날짜 파싱
import { describe, expect, it } from 'vitest'
import { parseLenientDate } from '@/lib/content/date'
import { getAllPosts, getAllCategories, getTilEntries } from '@/lib/content/loader'

describe('parseLenientDate (관대한 날짜 파싱)', () => {
  it('레거시 비표준 포맷(월/일 한 자리)을 파싱한다 — 2021-5-23 09:47:12', () => {
    const d = parseLenientDate('2021-5-23 09:47:12')
    expect(d.getFullYear()).toBe(2021)
    expect(d.getMonth()).toBe(4) // 5월 (0-based)
    expect(d.getDate()).toBe(23)
    expect(d.getHours()).toBe(9)
    expect(d.getMinutes()).toBe(47)
    expect(d.getSeconds()).toBe(12)
  })

  it('시간 없는 날짜와 ISO 포맷을 파싱한다', () => {
    expect(parseLenientDate('2026-07-01').getFullYear()).toBe(2026)
    expect(parseLenientDate('2024-3-1').getMonth()).toBe(2)
    expect(parseLenientDate('2024-03-10T12:00:00').getHours()).toBe(12)
  })

  it('YAML 파서가 이미 Date 로 변환한 값은 그대로 수용한다', () => {
    const now = new Date(2025, 0, 15)
    expect(parseLenientDate(now).getTime()).toBe(now.getTime())
  })

  it('파싱 불가능한 값은 파일 진단이 가능하도록 에러를 던진다', () => {
    expect(() => parseLenientDate('not-a-date')).toThrow(/not-a-date/)
  })
})

describe('getAllPosts (픽스처 인제스트)', () => {
  it('draft: true 포스트를 모든 표면에서 제외한다', () => {
    const posts = getAllPosts()
    expect(posts.some((p) => p.title === '작성 중인 초안')).toBe(false)
  })

  it('비-draft 픽스처 전건을 에러 없이 파싱한다 (3건)', () => {
    const posts = getAllPosts()
    expect(posts).toHaveLength(3)
    for (const p of posts) {
      expect(p.title).toBeTruthy()
      expect(p.category).toBeTruthy()
      expect(p.date).toBeInstanceOf(Date)
      expect(Number.isNaN(p.date.getTime())).toBe(false)
      expect(p.slug).toMatch(/^[^/]+\/[^/]+$/) // {category-dir}/{filename}
    }
  })

  it('draft 필드가 없는 포스트는 게시 상태로 취급한다', () => {
    const posts = getAllPosts()
    expect(posts.some((p) => p.title === '새 블로그를 시작하며')).toBe(true)
  })

  it('비표준 날짜 픽스처가 정확한 시각으로 파싱된다', () => {
    const post = getAllPosts().find((p) => p.title === 'Node.js 디버깅')
    expect(post).toBeDefined()
    expect(post!.date.getFullYear()).toBe(2021)
    expect(post!.date.getMonth()).toBe(4)
  })

  it('목록은 date 내림차순으로 정렬된다', () => {
    const posts = getAllPosts()
    const times = posts.map((p) => p.date.getTime())
    expect(times).toEqual([...times].sort((a, b) => b - a))
  })
})

describe('getAllCategories', () => {
  it('비-draft 포스트의 카테고리만 중복 없이 반환한다', () => {
    const categories = getAllCategories()
    expect(categories).toContain('NodeJS')
    expect(categories).toContain('JavaScript')
    expect(categories).toContain('Development')
    expect(new Set(categories).size).toBe(categories.length)
  })
})

describe('getTilEntries (til/ 하위 디렉터리)', () => {
  it('til 픽스처를 date 내림차순으로 파싱한다', () => {
    const entries = getTilEntries()
    expect(entries.length).toBeGreaterThanOrEqual(1)
    expect(entries[0].title).toBeTruthy()
    expect(entries[0].date).toBeInstanceOf(Date)
  })
})
