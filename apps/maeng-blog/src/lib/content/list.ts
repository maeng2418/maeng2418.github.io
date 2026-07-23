// 목록 정렬/필터 순수 함수 — REQ-BLOG-003 (서버/클라이언트 공용)
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
