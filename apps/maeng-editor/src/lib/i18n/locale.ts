// i18n 로케일 유틸 — REQ-ENH-004 (blog locale.ts 계약 패리티, 에디터 전용 스토리지 키)
// 스토리지를 주입받는 순수 함수로 구성해 node 환경 테스트와 SSR 안전성을 함께 확보한다.

export type Locale = 'ko' | 'en'

export const LOCALES: readonly Locale[] = ['ko', 'en']
export const DEFAULT_LOCALE: Locale = 'ko'
export const LOCALE_STORAGE_KEY = 'maeng-editor.locale'

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export function isLocale(value: unknown): value is Locale {
  return value === 'ko' || value === 'en'
}

export function toggleLocale(locale: Locale): Locale {
  return locale === 'ko' ? 'en' : 'ko'
}

/** 저장된 로케일 읽기 — 부재/비정상/스토리지 예외 시 기본 ko */
export function readStoredLocale(storage?: StorageLike | null): Locale {
  try {
    const stored = storage?.getItem(LOCALE_STORAGE_KEY)
    return isLocale(stored) ? stored : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

/** 선택 로케일 지속 — 실패(프라이빗 모드 등)는 조용히 무시한다 */
export function storeLocale(locale: Locale, storage?: StorageLike | null): void {
  try {
    storage?.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // 지속 실패는 치명적이지 않다 — 세션 내 토글은 state 로 계속 동작
  }
}
