// 핀 구간 높이 단일 정의 지점 — SPEC-MAENGV2-PORTFOLIO-SCROLL-007 D2 (REQ-PIN-002)
// 인라인 240/300/330/220vh 하드코딩을 대체한다. 각 핀 섹션의 useScroll offset
// ('start start' → 'end end')은 이 높이에서 스크럽 범위가 파생되므로, 높이 조정은
// 반드시 이 모듈에서만 수행한다 (높이·매핑 이원화 금지).

/** 핀 섹션별 스크롤 구간 높이 (vh — 스크롤 중 불변인 페이지 레이아웃 단위)
 *  M6: creed(이렇게 일합니다)·skills(기술 스택) 를 짧은 핀(~170vh)으로 전환 — 사용자 확정
 *  M6 보충: about(저는, 이런 developers 소개) 를 짧은 핀(180vh)으로 전환 — 4 밸류 카드
 *  + 지표 pill + 요약 문단이라 creed/skills(170) 보다 소폭 길게 잡는다 */
export const PIN_HEIGHTS_VH = {
  intro: 240,
  about: 180,
  projects: 300,
  career: 330,
  creed: 170,
  skills: 170,
  contact: 220,
} as const

export type PinSection = keyof typeof PIN_HEIGHTS_VH

/** 핀 컨테이너 인라인 스타일용 CSS 길이 문자열 파생 */
export function pinHeight(section: PinSection): string {
  return `${PIN_HEIGHTS_VH[section]}vh`
}
