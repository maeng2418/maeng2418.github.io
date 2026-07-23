// 레거시 이미지 상대 경로 해석 — REQ-BLOG-002 (SPEC ④ 무변환 수용 계약)
// 마크다운 본문/썸네일의 `../../images/<name>` (깊이 편차 허용) 참조를
// 빌드타임에 export-safe 한 public 경로 `/content-images/<name>` 으로 재작성한다.
// 실제 파일은 scripts/sync-content-images.mjs 가 content/images → public/content-images 로 복사.

// @MX:ANCHOR: [AUTO] SPEC ④ 무변환 수용 계약의 핵심 재작성 규칙 — 본문/썸네일 로더와 sync-content-images.mjs 가 이 접두사에 동기화되어 있음 (fan_in >= 3)
// @MX:REASON: 접두사/재작성 규칙 변경 시 scripts/sync-content-images.mjs 의 복사 목적지와 반드시 함께 변경해야 함. 불일치 시 정적 export 산출물에서 이미지 404
export const CONTENT_IMAGE_PUBLIC_PREFIX = '/content-images/'

const LEGACY_IMAGE_PATH_RE = /(?:\.\.\/)+images\//g

export function rewriteLegacyImagePaths(source: string): string {
  return source.replace(LEGACY_IMAGE_PATH_RE, CONTENT_IMAGE_PUBLIC_PREFIX)
}

/** frontmatter thumbnail 값 해석 — 없으면 null */
export function resolveThumbnail(thumbnail: unknown): string | null {
  if (typeof thumbnail !== 'string' || thumbnail.trim() === '') return null
  return rewriteLegacyImagePaths(thumbnail.trim())
}
