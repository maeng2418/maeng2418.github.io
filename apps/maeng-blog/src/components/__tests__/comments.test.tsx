// AC-ENH-006 — giscus 댓글: NEXT_PUBLIC_GISCUS_* 4값 env 게이트 (REQ-ENH-006)
// 정적 export 프리렌더(SSR) 시점에는 mounted 게이트로 항상 미렌더 — 상세 HTML 에
// giscus 마크업이 남지 않는다 (AC-ENH-006a 의 컴포넌트 수준 특성화).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NextIntlClientProvider } from 'next-intl'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Comments from '@/components/Comments'
import ko from '../../../messages/ko.json'

describe('Comments (giscus env 게이트)', () => {
  it('프리렌더(정적 HTML) 시점에는 giscus 마크업을 렌더하지 않는다', () => {
    const html = renderToStaticMarkup(
      <NextIntlClientProvider locale="ko" messages={ko} timeZone="Asia/Seoul">
        <Comments />
      </NextIntlClientProvider>
    )
    expect(html).toBe('')
  })

  it('4값(repo/repoId/category/categoryId) 전부 존재할 때만 렌더하는 env 게이트를 갖는다', () => {
    const source = readFileSync(join(__dirname, '..', 'Comments.tsx'), 'utf8')
    for (const key of [
      'NEXT_PUBLIC_GISCUS_REPO',
      'NEXT_PUBLIC_GISCUS_REPO_ID',
      'NEXT_PUBLIC_GISCUS_CATEGORY',
      'NEXT_PUBLIC_GISCUS_CATEGORY_ID',
    ]) {
      expect(source, `${key} 게이트 누락`).toContain(key)
    }
    // 부재 시 렌더 생략 (return null)
    expect(source).toContain('return null')
  })
})
