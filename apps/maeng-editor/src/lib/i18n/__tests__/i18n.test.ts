// AC-ENH-004 — editor i18n: 기본 ko / 토글 / localStorage 지속 + ko/en 카탈로그 키 패리티 (REQ-ENH-004)
import { describe, expect, it } from 'vitest'
import en from '../../../../messages/en.json'
import ko from '../../../../messages/ko.json'
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

describe('기본 로케일 (blog locale.ts 계약 패리티)', () => {
  it('기본값은 ko, 스토리지 부재/비정상 시 ko 폴백', () => {
    expect(DEFAULT_LOCALE).toBe('ko')
    expect(readStoredLocale(null)).toBe('ko')
    expect(readStoredLocale(memoryStorage({ [LOCALE_STORAGE_KEY]: 'fr' }))).toBe('ko')
  })

  it('스토리지 키는 에디터 전용 네임스페이스다', () => {
    expect(LOCALE_STORAGE_KEY).toBe('maeng-editor.locale')
  })
})

describe('토글 + 지속', () => {
  it('ko ↔ en 토글, isLocale 은 ko/en 만 허용', () => {
    expect(toggleLocale('ko')).toBe('en')
    expect(toggleLocale('en')).toBe('ko')
    expect(isLocale('jp')).toBe(false)
  })

  it('storeLocale → readStoredLocale 라운드트립, 예외 시 크래시 없음', () => {
    const storage = memoryStorage()
    storeLocale('en', storage)
    expect(readStoredLocale(storage)).toBe('en')

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

describe('카탈로그 (messages/{ko,en}.json)', () => {
  function keyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
    return Object.entries(obj).flatMap(([key, value]) =>
      value !== null && typeof value === 'object' && !Array.isArray(value)
        ? keyPaths(value as Record<string, unknown>, `${prefix}${key}.`)
        : [`${prefix}${key}`]
    )
  }

  it('ko/en 키 집합이 동일하다 (누락 번역 방지)', () => {
    expect(keyPaths(ko).sort()).toEqual(keyPaths(en).sort())
  })

  it('editor UI 크롬 필수 키를 포함한다', () => {
    for (const catalog of [ko, en] as const) {
      const paths = keyPaths(catalog)
      for (const required of [
        'editor.sidebar.newPost',
        'editor.form.save',
        'editor.status.saved',
        'editor.assist.title',
        'editor.localeSwitch.label',
        'editor.palette.placeholder',
        'editor.palette.save',
        'editor.palette.toggleLocale',
      ]) {
        expect(paths, `${required} 누락`).toContain(required)
      }
    }
  })
})
