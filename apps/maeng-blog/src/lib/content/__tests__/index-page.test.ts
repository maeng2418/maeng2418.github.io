// AC-BLOG-003 — 블로그 목록 페이지: 정렬/카테고리 필터
import { describe, expect, it } from 'vitest'
import { buildCategoryOptions, filterByCategory, sortByDateDesc, ALL_CATEGORY } from '@/lib/content/list'
import { getAllPosts } from '@/lib/content/loader'
import type { PostMeta } from '@/lib/content/types'

function stub(partial: Partial<PostMeta> & { title: string }): PostMeta {
  return {
    slug: `cat/${partial.title}`,
    slugParts: ['cat', partial.title],
    date: new Date(2026, 0, 1),
    dateFormatted: '2026. 01. 01',
    category: 'Cat',
    thumbnail: null,
    draft: false,
    excerpt: '',
    ...partial,
  }
}

describe('sortByDateDesc', () => {
  it('date 내림차순으로 정렬한다 (원본 불변)', () => {
    const a = stub({ title: 'a', date: new Date(2021, 4, 23) })
    const b = stub({ title: 'b', date: new Date(2026, 6, 1) })
    const c = stub({ title: 'c', date: new Date(2024, 2, 10) })
    const input = [a, c, b]
    const sorted = sortByDateDesc(input)
    expect(sorted.map((p) => p.title)).toEqual(['b', 'c', 'a'])
    expect(input.map((p) => p.title)).toEqual(['a', 'c', 'b'])
  })
})

describe('filterByCategory', () => {
  const posts = [
    stub({ title: 'n1', category: 'NodeJS' }),
    stub({ title: 'j1', category: 'JavaScript' }),
    stub({ title: 'n2', category: 'NodeJS' }),
  ]

  it('ALL 선택 시 전체를 반환한다', () => {
    expect(filterByCategory(posts, ALL_CATEGORY)).toHaveLength(3)
  })

  it('특정 카테고리만 반환한다', () => {
    const filtered = filterByCategory(posts, 'NodeJS')
    expect(filtered.map((p) => p.title)).toEqual(['n1', 'n2'])
  })

  it('일치 0건 카테고리는 빈 배열을 반환한다 (빈 상태 UI 대응)', () => {
    expect(filterByCategory(posts, 'Rust')).toEqual([])
  })
})

describe('buildCategoryOptions', () => {
  it('ALL 을 선두로, 콘텐츠에 존재하는 카테고리 전체를 포함한다', () => {
    const options = buildCategoryOptions([
      stub({ title: 'x', category: 'Web' }),
      stub({ title: 'y', category: 'Git' }),
      stub({ title: 'z', category: 'Web' }),
    ])
    expect(options[0]).toBe(ALL_CATEGORY)
    expect(options.slice(1).sort()).toEqual(['Git', 'Web'])
    expect(new Set(options).size).toBe(options.length)
  })
})

describe('목록 페이지 데이터 (픽스처 통합)', () => {
  it('비-draft 포스트가 date 내림차순으로 제공된다', () => {
    const posts = getAllPosts()
    expect(posts[0].title).toBe('새 블로그를 시작하며') // 2026-07-01 최신
    expect(posts.at(-1)!.title).toBe('Node.js 디버깅') // 2021 최고(最古)
  })

  it('각 포스트가 목록 카드 구성 요소(제목/발췌/카테고리)를 갖는다', () => {
    for (const p of getAllPosts()) {
      expect(p.title).toBeTruthy()
      expect(p.excerpt).toBeTruthy()
      expect(p.category).toBeTruthy()
      expect(p.dateFormatted).toMatch(/^\d{4}\. \d{2}\. \d{2}$/)
    }
  })
})
