// AC-ENH-008 — PostList reveal 모션: 수제 IntersectionObserver/.reveal 클래스 → motion(whileInView) 전환 (REQ-ENH-008)
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import LocaleProvider from '@/components/i18n/LocaleProvider'
import PostList, { type CardPost } from '@/components/PostList'

const POSTS: CardPost[] = [
  {
    slug: 'development/hello',
    title: '첫 포스트',
    dateFormatted: 'JUL 24, 2026',
    category: 'development',
    thumbnail: null,
    excerpt: '요약',
    readingMinutes: 2,
  },
  {
    slug: 'til/second',
    title: '두 번째 포스트',
    dateFormatted: 'JUL 23, 2026',
    category: 'til',
    thumbnail: null,
    excerpt: '요약 2',
    readingMinutes: 1,
  },
]

describe('PostList (motion 전환 후 동작 보존)', () => {
  it('포스트 카드(제목/카테고리/날짜)가 렌더된다', () => {
    const html = renderToStaticMarkup(
      <LocaleProvider>
        <PostList posts={POSTS} categories={['ALL', 'development', 'til']} />
      </LocaleProvider>
    )
    expect(html).toContain('첫 포스트')
    expect(html).toContain('두 번째 포스트')
    expect(html).toContain('JUL 24, 2026')
    // 테스트 환경(next.config 미적용)에서는 Link 가 trailing slash 를 정규화한다
    expect(html).toContain('/posts/development/hello')
  })

  it('카테고리별 개수, 읽기 시간, 최신 글 2×2 카드를 렌더한다', () => {
    const html = renderToStaticMarkup(
      <LocaleProvider>
        <PostList posts={POSTS} categories={['ALL', 'development', 'til']} />
      </LocaleProvider>
    )
    expect(html).toContain('전체<b>2</b>')
    expect(html).toContain('development<b>1</b>')
    expect(html).toContain('읽기 2분')
    expect(html).toContain('2편 · 최신순')
    expect(html.match(/is-feat/g)).toHaveLength(1)
    // 썸네일 없는 글은 카테고리 마크 커버
    expect(html).toContain('DEV')
  })
})
