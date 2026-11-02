// 테마 저장/해석 계약 — ThemeToggle 과 프리하이드레이션 스크립트가 공유하는 lib/theme.ts
import { describe, expect, it } from 'vitest'
import { readStoredTheme, resolveTheme, THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from '@/lib/theme'

const storageOf = (value: string | null) => ({ getItem: () => value })

describe('theme', () => {
  it('유효한 저장값만 읽고 나머지는 null', () => {
    expect(readStoredTheme(storageOf('dark'))).toBe('dark')
    expect(readStoredTheme(storageOf('blue'))).toBeNull()
    expect(readStoredTheme(storageOf(null))).toBeNull()
    expect(
      readStoredTheme({
        getItem: () => {
          throw new Error('denied')
        },
      })
    ).toBeNull()
  })

  it('저장값 우선, 없으면 시스템 선호', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme(null, false)).toBe('light')
  })

  it('인라인 스크립트는 같은 저장 키를 쓴다', () => {
    expect(THEME_INIT_SCRIPT).toContain(THEME_STORAGE_KEY)
    expect(THEME_INIT_SCRIPT).toContain('dataset.theme')
  })
})
