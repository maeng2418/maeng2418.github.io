// AC-BLOG-002b — 콘텐츠 계층: 레거시 이미지 상대 경로 해석
import { describe, expect, it } from 'vitest'
import { rewriteLegacyImagePaths, CONTENT_IMAGE_PUBLIC_PREFIX } from '@/lib/content/images'
import { getAllPosts, getPostBySlug } from '@/lib/content/loader'

describe('rewriteLegacyImagePaths', () => {
  it('../../images/<name> 을 서빙 가능한 public 경로로 재작성한다', () => {
    const input = '![로고](../../images/NodeJS.png)'
    const output = rewriteLegacyImagePaths(input)
    expect(output).toBe(`![로고](${CONTENT_IMAGE_PUBLIC_PREFIX}NodeJS.png)`)
    expect(output).not.toContain('../../images/')
  })

  it('여러 참조와 얕은 상대 경로(../images/)도 일반화하여 재작성한다', () => {
    const input = '![](../../images/a.png) 본문 ![](../images/b.png)'
    const output = rewriteLegacyImagePaths(input)
    expect(output).not.toMatch(/\.\.\/(?:\.\.\/)?images\//)
    expect(output).toContain(`${CONTENT_IMAGE_PUBLIC_PREFIX}a.png`)
    expect(output).toContain(`${CONTENT_IMAGE_PUBLIC_PREFIX}b.png`)
  })

  it('외부 URL 과 무관한 경로는 건드리지 않는다', () => {
    const input = '![](https://example.com/images/x.png) ![](/already/ok.png)'
    expect(rewriteLegacyImagePaths(input)).toBe(input)
  })
})

describe('썸네일/본문 이미지 해석 (픽스처 통합)', () => {
  it('frontmatter thumbnail 의 레거시 경로가 재작성된다', () => {
    const post = getAllPosts().find((p) => p.title === 'Node.js 디버깅')
    expect(post?.thumbnail).toBe(`${CONTENT_IMAGE_PUBLIC_PREFIX}NodeJS.png`)
  })

  it('렌더된 포스트 HTML 에 원시 ../../images/ 리터럴이 남지 않는다', async () => {
    const meta = getAllPosts().find((p) => p.title === 'Node.js 디버깅')
    const post = await getPostBySlug(meta!.slugParts)
    expect(post).not.toBeNull()
    expect(post!.html).toContain(`src="${CONTENT_IMAGE_PUBLIC_PREFIX}NodeJS.png"`)
    expect(post!.html).not.toContain('../../images/')
  })
})
