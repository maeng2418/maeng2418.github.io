// AC-ENH-002/003 — next-intl 클라이언트 프로바이더: 기본 ko · 카탈로그 공급 · useTranslations 소비 (REQ-ENH-001~003)
// locale.ts 유틸 계약(기본 ko/토글/지속/예외 폴백)은 기존 i18n.test.ts 가 계속 검증한다.
import { renderToStaticMarkup } from 'react-dom/server'
import { useTranslations } from 'next-intl'
import { describe, expect, it } from 'vitest'
import LocaleProvider from '@/components/i18n/LocaleProvider'

function NavProbe() {
  const t = useTranslations('nav')
  return <span>{t('blog')}</span>
}

describe('LocaleProvider (next-intl 클라이언트 프로바이더 모드)', () => {
  it('기본 로케일은 ko — nav 카탈로그가 한국어로 공급된다', () => {
    const html = renderToStaticMarkup(
      <LocaleProvider>
        <NavProbe />
      </LocaleProvider>
    )
    expect(html).toContain('블로그')
  })

  it('initialLocale=en 이면 en 카탈로그가 공급된다', () => {
    const html = renderToStaticMarkup(
      <LocaleProvider initialLocale="en">
        <NavProbe />
      </LocaleProvider>
    )
    expect(html).toContain('Blog')
  })
})
