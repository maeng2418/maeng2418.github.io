// 콘텐츠 데이터 모델 — plan.md §B.1
// frontmatter 스키마는 레거시 그대로: title / date / category / thumbnail / draft (추가 필드 금지)
// readingMinutes / charCount / headings 는 본문에서 빌드타임에 유도되는 파생값이다 (frontmatter 아님).
import type { Heading } from './headings'

export type { Heading }

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
  /** 본문 기준 읽기 시간(분, 최소 1) — 목록/상세 메타 */
  readingMinutes: number
  /** 본문 글자 수(공백 제외) — 상세 헤더 보조 메타 */
  charCount: number
}

export interface Post extends PostMeta {
  html: string
  /** 본문 h2/h3 목차 (rehype-slug id 기준) */
  headings: Heading[]
}

/** 상세 하단 내비 — 이전(더 오래된) / 다음(더 최신) 글. 없으면 null */
export interface AdjacentPosts {
  prev: PostMeta | null
  next: PostMeta | null
}

