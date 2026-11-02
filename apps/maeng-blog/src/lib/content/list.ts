// 목록 정렬/필터/그룹 순수 함수 — REQ-BLOG-003 (서버/클라이언트 공용)
import type { PostMeta } from './types'

export const ALL_CATEGORY = 'ALL'

export function sortByDateDesc<T extends { date: Date }>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) => b.date.getTime() - a.date.getTime())
}

export function filterByCategory<T extends { category: string }>(
  posts: readonly T[],
  category: string
): T[] {
  if (category === ALL_CATEGORY) return [...posts]
  return posts.filter((p) => p.category === category)
}

/** ALL 선두 + 콘텐츠에 존재하는 카테고리 전체 (등장 순, 중복 제거) — REQ-BLOG-003 */
export function buildCategoryOptions(posts: readonly PostMeta[]): string[] {
  return [ALL_CATEGORY, ...new Set(posts.map((p) => p.category))]
}

/** 카테고리별 글 수 — 필터 칩의 카운트 배지. ALL 은 전체 수 */
export function countByCategory(posts: readonly { category: string }[]): Record<string, number> {
  const counts: Record<string, number> = { [ALL_CATEGORY]: posts.length }
  for (const p of posts) counts[p.category] = (counts[p.category] ?? 0) + 1
  return counts
}

export interface YearGroup<T> {
  year: number
  posts: T[]
}

/** 입력 순서를 유지한 채 연도별로 묶는다 (date 내림차순 입력 → 최신 연도가 먼저) */
export function groupByYear<T extends { date: Date }>(posts: readonly T[]): YearGroup<T>[] {
  const groups: YearGroup<T>[] = []
  for (const p of posts) {
    const year = p.date.getFullYear()
    const last = groups[groups.length - 1]
    if (last && last.year === year) last.posts.push(p)
    else groups.push({ year, posts: [p] })
  }
  return groups
}

/** 같은 카테고리 우선, 부족하면 다른 글로 채운 "이어서 읽기" 후보 (self 제외, 입력 순서 유지) */
export function pickRelated<T extends { slug: string; category: string }>(
  posts: readonly T[],
  current: Pick<T, 'slug' | 'category'>,
  limit = 2,
  /** 이전/다음 글처럼 이미 다른 자리에 노출된 slug — 중복 추천을 피한다 */
  exclude: readonly string[] = []
): T[] {
  const skip = new Set([current.slug, ...exclude])
  const others = posts.filter((p) => !skip.has(p.slug))
  const same = others.filter((p) => p.category === current.category)
  const rest = others.filter((p) => p.category !== current.category)
  return [...same, ...rest].slice(0, limit)
}
