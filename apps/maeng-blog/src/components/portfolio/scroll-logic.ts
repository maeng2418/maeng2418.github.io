// 스크롤 측정 경로 순수 로직 — SPEC-MAENGV2-PORTFOLIO-SCROLL-007 D4
// (REQ-SCROLL-001..002, REQ-RAIL-001..002)
// jsdom 에는 IntersectionObserver/ResizeObserver 가 없으므로 (acceptance E-7)
// 판정·측정 로직을 순수 함수로 분리해 단위 테스트하고, 관측자 배선은
// PortfolioScroll 의 이펙트에서 런타임 가드와 함께 수행한다.

/** 수평 레일 스크럽 최대 이동량 — 콘텐츠 폭이 래퍼 폭을 넘는 만큼 (음수 금지) */
export function computeRailMax(scrollWidth: number, clientWidth: number): number {
  return Math.max(0, scrollWidth - clientWidth)
}

export type ChapterIntersection = {
  index: number
  isIntersecting: boolean
}

/**
 * 활성 챕터 판정 — 뷰포트 중앙선(rootMargin -50%/-50%)과 교차 중인 섹션을
 * 활성으로 본다. 교차 항목이 없으면(경계 통과 순간) 현재 값을 유지해
 * 기존 gBCR 판정("top<=mid && bottom>=mid")과 동등한 표시 결과를 낸다.
 */
export function pickActiveChapter(current: number, entries: ChapterIntersection[]): number {
  let active = current
  for (const entry of entries) {
    if (entry.isIntersecting) active = entry.index
  }
  return active
}
