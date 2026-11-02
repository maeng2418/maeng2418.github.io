// 읽기 시간 / 글자 수 / 목차 / 이전·다음 / 이어서 읽기 — 블로그 리뉴얼(목록·상세 메타) 파생값
import { describe, expect, it } from 'vitest'
import { countCharacters, estimateReadingMinutes } from '@/lib/content/reading-time'
import { countByCategory, groupByYear, pickRelated } from '@/lib/content/list'
import { renderMarkdown } from '@/lib/content/render'
import { getAdjacentPosts, getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/content/loader'

describe('estimateReadingMinutes', () => {
  it('빈 본문도 최소 1분이다', () => {
    expect(estimateReadingMinutes('')).toBe(1)
  })

  it('한글 500자당 1분으로 올림한다 (코드 블록은 제외)', () => {
    const korean = '가'.repeat(1001)
    expect(estimateReadingMinutes(korean)).toBe(3)
    expect(estimateReadingMinutes(`${'가'.repeat(400)}\n\`\`\`ts\n${'x '.repeat(5000)}\n\`\`\``)).toBe(1)
  })

  it('영문은 200단어당 1분이다', () => {
    expect(estimateReadingMinutes('word '.repeat(401))).toBe(3)
  })

  it('countCharacters 는 마크다운 문법과 공백을 제외한 글자 수다', () => {
    expect(countCharacters('## 제목\n\n본문 **강조** 입니다.')).toBe('제목본문강조입니다.'.length)
  })
})

describe('renderMarkdown 목차', () => {
  it('h2/h3 만 id·텍스트·깊이로 수집하고 h1/h4 는 제외한다', async () => {
    const { headings } = await renderMarkdown(
      '# 제목\n\n## 첫 절\n\n### `코드` 소절\n\n#### 깊은 절\n\n## 둘째 절'
    )
    expect(headings).toEqual([
      { id: '첫-절', text: '첫 절', depth: 2 },
      { id: '코드-소절', text: '코드 소절', depth: 3 },
      { id: '둘째-절', text: '둘째 절', depth: 2 },
    ])
  })
})

describe('목록 보조 함수', () => {
  const posts = [
    { slug: 'a/1', category: 'A', date: new Date(2026, 0, 2) },
    { slug: 'b/1', category: 'B', date: new Date(2026, 0, 1) },
    { slug: 'a/2', category: 'A', date: new Date(2024, 5, 1) },
  ]

  it('countByCategory 는 ALL 전체 수와 카테고리별 수를 준다', () => {
    expect(countByCategory(posts)).toEqual({ ALL: 3, A: 2, B: 1 })
  })

  it('groupByYear 는 입력 순서를 유지하며 연도로 묶는다', () => {
    const groups = groupByYear(posts)
    expect(groups.map((g) => [g.year, g.posts.length])).toEqual([
      [2026, 2],
      [2024, 1],
    ])
  })

  it('pickRelated 는 자신을 빼고 같은 카테고리를 먼저, 부족하면 다른 글로 채운다', () => {
    expect(pickRelated(posts, posts[0], 2).map((p) => p.slug)).toEqual(['a/2', 'b/1'])
    expect(pickRelated(posts, posts[1], 1).map((p) => p.slug)).toEqual(['a/1'])
    expect(pickRelated(posts, posts[0], 2, ['a/2']).map((p) => p.slug)).toEqual(['b/1'])
  })
})

describe('픽스처 통합 (loader)', () => {
  it('모든 포스트가 readingMinutes ≥ 1, charCount > 0 을 갖는다', () => {
    for (const p of getAllPosts()) {
      expect(p.readingMinutes).toBeGreaterThanOrEqual(1)
      expect(p.charCount).toBeGreaterThan(0)
    }
  })

  it('상세는 headings 를 포함한다', async () => {
    const post = await getPostBySlug(['nodejs', 'debugging'])
    expect(post!.headings.length).toBeGreaterThan(0)
    expect(post!.headings[0]).toHaveProperty('id')
  })

  it('최신 글은 next 가 없고 prev 는 바로 이전 글이다', () => {
    const posts = getAllPosts()
    const { prev, next } = getAdjacentPosts(posts[0].slug)
    expect(next).toBeNull()
    expect(prev?.slug).toBe(posts[1].slug)
    expect(getAdjacentPosts('nope/missing')).toEqual({ prev: null, next: null })
  })

  it('이어서 읽기는 자신을 제외하고 최대 limit 개를 돌려준다', () => {
    const posts = getAllPosts()
    const related = getRelatedPosts(posts[0].slug, 2)
    expect(related).toHaveLength(Math.min(2, posts.length - 1))
    expect(related.map((p) => p.slug)).not.toContain(posts[0].slug)
  })
})
