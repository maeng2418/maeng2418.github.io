'use client'

// next-intl 클라이언트 프로바이더 — REQ-ENH-004 (blog 와 동일 패턴 일원화, design.md §2)
// 로컬 단독 도구이므로 SSR 시점 로케일 반영은 하지 않는다: ko 기본 렌더 → 마운트 후 저장 로케일 반영.
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
  /** ko ↔ en 전환 + localStorage 지속 */
  toggle: () => void
}

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
  /** 테스트 전용 초기 로케일 — 런타임 기본은 ko */
  initialLocale?: Locale
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

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
