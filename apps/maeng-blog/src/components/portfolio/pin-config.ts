// 핀 구간 높이 단일 정의 지점 — SPEC-MAENGV2-PORTFOLIO-SCROLL-007 D2 (REQ-PIN-002)
// 인라인 240/300/330/220vh 하드코딩을 대체한다. 각 핀 섹션의 useScroll offset
// ('start start' → 'end end')은 이 높이에서 스크럽 범위가 파생되므로, 높이 조정은
// 반드시 이 모듈에서만 수행한다 (높이·매핑 이원화 금지).

/** 핀 섹션별 스크롤 구간 높이 (vh — 스크롤 중 불변인 페이지 레이아웃 단위)
 *  M6: creed(이렇게 일합니다)·skills(기술 스택) 를 짧은 핀으로 전환 — 사용자 확정
 *  M6 보충: about(소개) 를 짧은 핀으로 전환 (creed/skills 패턴 준용)
 *  M6 보충 2 (전역 dwell 튜닝): 리빌은 핀 초반(~0.32)에 완료(PinReveal 압축)되므로
 *  높이의 나머지 구간 전체가 완전 노출 hold 가 된다.
 *  M6 보충 3: 전 핀 높이 ~30% 추가 상향 — 섹션별 머무름 확대 (사용자 요청).
 *  about 은 콘텐츠(4 카드 + 지표 pill + 요약)가 많아 creed/skills 보다 소폭 길게 */
export const PIN_HEIGHTS_VH = {
  intro: 300,
  about: 280,
  projects: 380,
  career: 420,
  creed: 270,
  skills: 270,
  contact: 280,
} as const

export type PinSection = keyof typeof PIN_HEIGHTS_VH

/** 핀 컨테이너 인라인 스타일용 CSS 길이 문자열 파생 */
export function pinHeight(section: PinSection): string {
  return `${PIN_HEIGHTS_VH[section]}vh`
}
