'use client'

// next-intl 클라이언트 프로바이더 모드 — REQ-ENH-001~003 (design.md §1)
// 정적 export(REQ-BLOG-008) 제약상 next-intl 의 서버 요청 구성(플러그인·미들웨어·요청 시점 설정)을
// 쓰지 않고, locale/messages 를 props 로 직접 공급한다. 로케일 저장/판별은 기존 locale.ts 계약 재사용:
// 프리하이드레이션은 ko 기본 렌더 → 마운트 후 저장 로케일 반영 (기존 수제 레이어와 동일 특성).
import { createContext, useContext, useEffect, useState } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import {
  DEFAULT_LOCALE,
  readStoredLocale,
  storeLocale,
  toggleLocale,
  type Locale,
} from '@/lib/i18n/locale'
import en from '../../../messages/en.json'
import ko from '../../../messages/ko.json'

const MESSAGES = { ko, en } as const

interface LocaleToggleValue {
  locale: Locale
  /** ko ↔ en 전환 + localStorage 지속 (REQ-ENH-002) */
  toggle: () => void
}

// @MX:ANCHOR: [AUTO] 앱 전역 로케일 상태의 단일 공급점 — SiteHeader/PortfolioScroll 등 UI 크롬이 소비
// @MX:REASON: 토글·지속·기본 ko 계약이 여기 한 곳에서 관리된다. 계약 변경 시 소비 컴포넌트 전체가 회귀함
const LocaleToggleContext = createContext<LocaleToggleValue>({
  locale: DEFAULT_LOCALE,
  toggle: () => {},
})

export function useLocaleToggle(): LocaleToggleValue {
  return useContext(LocaleToggleContext)
}

export default function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode
  /** 테스트/스토리 전용 초기 로케일 — 런타임 기본은 ko (REQ-ENH-002 폴백 계약) */
  initialLocale?: Locale
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  // localStorage 하이드레이션 — 렌더 중 접근 금지 (SSR/정적 export 안전)
  useEffect(() => {
    setLocale(readStoredLocale(window.localStorage))
  }, [])

  const toggle = () => {
    setLocale((prev) => {
      const next = toggleLocale(prev)
      storeLocale(next, window.localStorage)
      return next
    })
  }

  return (
    <LocaleToggleContext.Provider value={{ locale, toggle }}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Asia/Seoul">
        {children}
      </NextIntlClientProvider>
    </LocaleToggleContext.Provider>
  )
}
