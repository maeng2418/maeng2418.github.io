'use client'

// 라이트/다크 수동 전환 — 저장 키·적용은 lib/theme.ts 계약을 따른다.
// 마운트 전에는 ☾(라이트 가정)로 렌더하고 마운트 후 저장값/시스템 선호로 보정한다.
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from '@/lib/theme'

export default function ThemeToggle() {
  const t = useTranslations('nav')
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(
      resolveTheme(
        readStoredTheme(window.localStorage),
        window.matchMedia('(prefers-color-scheme: dark)').matches
      )
    )
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next, document.documentElement)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // 저장 실패(프라이빗 모드 등)는 무시 — 현재 세션에는 이미 적용됨
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('theme')}
      aria-pressed={theme === 'dark'}
      className="site-ib"
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
