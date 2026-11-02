// 카테고리 커버 — 썸네일이 없는 글의 카드 커버(그라디언트 + 마크)와 카테고리 점 색.
// 시안 M1(스포트라이트 그리드)의 COVER 테이블을 코드로 옮긴 것. 모르는 카테고리는 accent 계열로 폴백한다.
export interface Cover {
  c1: string
  c2: string
  mark: string
}

const COVERS: Record<string, Cover> = {
  typescript: { c1: '#2b3fea', c2: '#6b7cff', mark: 'TS' },
  react: { c1: '#0f766e', c2: '#2dd4bf', mark: '⚛' },
  javascript: { c1: '#b45309', c2: '#f59e0b', mark: 'JS' },
  development: { c1: '#1f1f2b', c2: '#4a4a66', mark: 'DEV' },
  web: { c1: '#6d28d9', c2: '#a78bfa', mark: 'WWW' },
  git: { c1: '#be123c', c2: '#fb7185', mark: 'GIT' },
  nodejs: { c1: '#3f6212', c2: '#84cc16', mark: 'NODE' },
}

const FALLBACK: Cover = { c1: '#2b3fea', c2: '#6b7cff', mark: '' }

export function coverFor(category: string): Cover {
  const found = COVERS[category.toLowerCase()]
  if (found) return found
  return { ...FALLBACK, mark: category.slice(0, 3).toUpperCase() }
}
