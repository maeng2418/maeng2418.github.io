// AC-BLOG-007 — i18n: 기본 ko / 토글 / localStorage 지속 (REQ-BLOG-007)
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isLocale,
  readStoredLocale,
  storeLocale,
  toggleLocale,
} from '@/lib/i18n/locale'

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
    map,
  }
}

describe('기본 로케일', () => {
  it('기본값은 ko 다', () => {
    expect(DEFAULT_LOCALE).toBe('ko')
  })

  it('스토리지가 없으면(ko 최초 방문/SSR) 기본 ko 를 반환한다', () => {
    expect(readStoredLocale(null)).toBe('ko')
    expect(readStoredLocale(undefined)).toBe('ko')
    expect(readStoredLocale(memoryStorage())).toBe('ko')
  })

  it('비정상 저장값은 기본 ko 로 폴백한다', () => {
    expect(readStoredLocale(memoryStorage({ [LOCALE_STORAGE_KEY]: 'fr' }))).toBe('ko')
  })
})

describe('토글', () => {
  it('ko ↔ en 을 전환한다', () => {
    expect(toggleLocale('ko')).toBe('en')
    expect(toggleLocale('en')).toBe('ko')
  })

  it('isLocale 은 ko/en 만 허용한다', () => {
    expect(isLocale('ko')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('jp')).toBe(false)
    expect(isLocale(null)).toBe(false)
  })
})

describe('localStorage 지속 (리로드 시 유지)', () => {
  it('storeLocale → readStoredLocale 라운드트립으로 선택이 유지된다', () => {
    const storage = memoryStorage()
    storeLocale('en', storage)
    expect(storage.map.get(LOCALE_STORAGE_KEY)).toBe('en')
    expect(readStoredLocale(storage)).toBe('en')

    storeLocale('ko', storage)
    expect(readStoredLocale(storage)).toBe('ko')
  })

  it('스토리지 예외(프라이빗 모드 등)에도 크래시 없이 기본값으로 동작한다', () => {
    const throwing = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
    }
    expect(() => storeLocale('en', throwing)).not.toThrow()
    expect(readStoredLocale(throwing)).toBe(DEFAULT_LOCALE)
  })
})
