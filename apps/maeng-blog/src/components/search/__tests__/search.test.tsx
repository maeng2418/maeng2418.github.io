// AC-ENH-005 — pagefind 검색 진입점: 헤더 버튼 + 모달, 카탈로그 문자열 (REQ-ENH-005)
import { NextIntlClientProvider } from 'next-intl'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Search from '@/components/search/Search'
import en from '../../../../messages/en.json'
import ko from '../../../../messages/ko.json'

function render(ui: React.ReactElement, messages: typeof ko = ko) {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale="ko" messages={messages} timeZone="Asia/Seoul">
      {ui}
    </NextIntlClientProvider>
  )
}

describe('Search (pagefind 진입점)', () => {
  it('기본 상태에서는 검색 열기 버튼만 렌더된다 (모달 닫힘)', () => {
    const html = render(<Search />)
    expect(html).toContain(ko.search.open)
    expect(html).not.toContain(ko.search.placeholder)
  })

  it('열림 상태에서 검색 입력(placeholder)이 카탈로그 문자열로 렌더된다', () => {
    const html = render(<Search defaultOpen />)
    expect(html).toContain(ko.search.placeholder)
    expect(html).toContain('role="dialog"')
  })

  it('ko/en 검색 카탈로그 키 패리티 — 미번역 키 없음', () => {
    expect(Object.keys(ko.search).sort()).toEqual(Object.keys(en.search).sort())
  })
})
