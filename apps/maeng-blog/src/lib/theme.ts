// 테마(라이트/다크) 저장·적용 계약 — ThemeToggle 과 layout 의 프리하이드레이션 스크립트가 공유한다.
// globals.css 는 prefers-color-scheme 기본 + :root[data-theme] 수동 오버라이드를 이미 지원하므로
// 여기서는 localStorage 키와 <html data-theme> 반영만 담당한다.
export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'maeng-blog.theme'

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

export function readStoredTheme(storage: Pick<Storage, 'getItem'>): Theme | null {
  try {
    const value = storage.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

/** 저장값 우선, 없으면 시스템 선호 */
export function resolveTheme(stored: Theme | null, prefersDark: boolean): Theme {
  return stored ?? (prefersDark ? 'dark' : 'light')
}

export function applyTheme(theme: Theme, root: HTMLElement): void {
  root.dataset.theme = theme
}

/** <head> 인라인 — 첫 페인트 전에 저장 테마를 반영해 깜빡임을 막는다 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t}}catch(e){}})()`
