// 콘텐츠 데이터 모델 — plan.md §B.1
// frontmatter 스키마는 레거시 그대로: title / date / category / thumbnail / draft (추가 필드 금지)

export interface PostMeta {
  /** `markdowns/` 기준 상대 경로에서 유도 — `{category-dir}/{filename}` */
  slug: string
  /** 라우트 세그먼트 배열 — /posts/[...slug] 용 */
  slugParts: string[]
  title: string
  date: Date
  /** `YYYY. MM. DD` 표기 (디자인 시안 캡션 포맷) */
  dateFormatted: string
  category: string
  /** 레거시 상대 경로가 public 경로로 재작성된 값. 없으면 null */
  thumbnail: string | null
  draft: boolean
  excerpt: string
}

export interface Post extends PostMeta {
  html: string
}

export interface TilEntry {
  slug: string
  title: string
  date: Date
  dateFormatted: string
  html: string
}
