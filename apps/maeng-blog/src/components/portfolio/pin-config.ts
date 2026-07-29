// 핀 구간 높이 단일 정의 지점 — SPEC-MAENGV2-PORTFOLIO-SCROLL-007 D2 (REQ-PIN-002)
// 인라인 240/300/330/220vh 하드코딩을 대체한다. 각 핀 섹션의 useScroll offset
// ('start start' → 'end end')은 이 높이에서 스크럽 범위가 파생되므로, 높이 조정은
// 반드시 이 모듈에서만 수행한다 (높이·매핑 이원화 금지).

/** 핀 섹션별 스크롤 구간 높이 (vh — 스크롤 중 불변인 페이지 레이아웃 단위) */
export const PIN_HEIGHTS_VH = {
  intro: 240,
  projects: 300,
  career: 330,
  contact: 220,
} as const

export type PinSection = keyof typeof PIN_HEIGHTS_VH

/** 핀 컨테이너 인라인 스타일용 CSS 길이 문자열 파생 */
export function pinHeight(section: PinSection): string {
  return `${PIN_HEIGHTS_VH[section]}vh`
}
