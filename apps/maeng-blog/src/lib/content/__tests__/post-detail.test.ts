// AC-BLOG-004 — 포스트 상세 렌더 파이프라인 (GFM / shiki / KaTeX / emoji / 메타데이터)
import { describe, expect, it } from 'vitest'
import { renderMarkdownToHtml } from '@/lib/content/render'
import { getAllPosts, getPostBySlug } from '@/lib/content/loader'

describe('renderMarkdownToHtml (unified 파이프라인)', () => {
  it('GFM 테이블을 렌더한다', async () => {
    const html = await renderMarkdownToHtml('| a | b |\n| --- | --- |\n| 1 | 2 |')
    expect(html).toContain('<table>')
    expect(html).toContain('<td>1</td>')
  })

  it('코드 블록을 shiki 듀얼 테마 토큰으로 하이라이트한다', async () => {
    const html = await renderMarkdownToHtml('```ts\nconst x: number = 1\n```')
    expect(html).toMatch(/--shiki-light|data-theme/)
    expect(html).toContain('<pre')
  })

  it('KaTeX 수식을 .katex 마크업으로 렌더한다', async () => {
    const html = await renderMarkdownToHtml('인라인 $E = mc^2$ 수식')
    expect(html).toContain('class="katex"')
  })

  it('이모지 숏코드를 변환한다', async () => {
    const html = await renderMarkdownToHtml('출발 :rocket:')
    expect(html).toContain('🚀')
  })

  it('레거시 인라인 HTML(<br/>)을 보존한다 (rehype-raw)', async () => {
    const html = await renderMarkdownToHtml('첫 줄<br/>둘째 줄')
    expect(html).toContain('<br>')
  })
})

describe('getPostBySlug (픽스처 통합)', () => {
  it('KaTeX + 코드 픽스처가 렌더 파이프라인 전체를 통과한다', async () => {
    const meta = getAllPosts().find((p) => p.title === '빅오 표기법과 시간 복잡도')
    const post = await getPostBySlug(meta!.slugParts)
    expect(post).not.toBeNull()
    expect(post!.html).toContain('class="katex"')
    expect(post!.html).toMatch(/--shiki-light|data-theme/)
    expect(post!.html).toContain('🚀')
  })

  it('존재하지 않는 slug 는 null 을 반환한다', async () => {
    expect(await getPostBySlug(['nope', 'missing'])).toBeNull()
  })

  it('draft 포스트는 상세에서도 노출되지 않는다', async () => {
    expect(await getPostBySlug(['development', 'draft-post'])).toBeNull()
  })
})

describe('포스트 메타데이터 (Next Metadata API 입력)', () => {
  it('per-post 제목/설명이 frontmatter 에서 유도된다', async () => {
    const { generateMetadata } = await import('@/app/posts/[...slug]/page')
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: ['nodejs', 'debugging'] }),
    })
    expect(meta.title).toBe('Node.js 디버깅')
    expect(meta.description).toBeTruthy()
    expect(meta.openGraph?.title).toBe('Node.js 디버깅')
  })
})
