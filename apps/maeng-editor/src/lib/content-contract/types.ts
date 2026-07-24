// 블로그 콘텐츠 계약 타입 — REQ-EDITOR-003
// SSOT: maeng-v2/apps/maeng-blog/src/lib/content/{types,loader}.ts (gray-matter frontmatter 계약).
// 계약 키는 정확히 5개: title / date / category / thumbnail(선택) / draft — 추가 필드 금지.

export interface PostFrontmatter {
  title: string
  /** frontmatter 원문 문자열 표기 (blog parseLenientDate 가 수용하는 형식) */
  date: string
  category: string
  /** 선택 — 없으면 frontmatter 에서 키 자체를 생략한다 */
  thumbnail?: string
  /** 선택 — 블로그 로더는 키 부재를 게시 상태(false)로 취급한다 */
  draft?: boolean
}

export interface ParsedPost {
  frontmatter: PostFrontmatter
  /** frontmatter 를 제외한 마크다운 본문 */
  body: string
  /** parseLenientDate 로 해석된 날짜 (blog loader 와 동일 의미) */
  date: Date
}

/** 계약이 허용하는 frontmatter 키 전체 집합 (순서 = 직렬화 순서) */
export const CONTRACT_KEYS = ['title', 'date', 'category', 'thumbnail', 'draft'] as const
export type ContractKey = (typeof CONTRACT_KEYS)[number]
