// 스크롤 스크럽 순수 로직 — 시안 v18
// jsdom 에는 레이아웃/IntersectionObserver 가 없으므로 진행률·단계·카운터 계산을 순수 함수로
// 분리해 단위 테스트하고, DOM 배선은 PortfolioScroll 의 이펙트가 담당한다.

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

/** cubic ease-out — 카운터가 끝에서 천천히 멈춘다 */
export function easeOut(q: number): number {
  return 1 - Math.pow(1 - q, 3)
}

/**
 * 핀 섹션 진행률 — 섹션 상단이 뷰포트 상단에 닿은 순간 0, 섹션 하단이 뷰포트 하단에 닿으면 1.
 * @param top 섹션의 getBoundingClientRect().top
 * @param height 섹션 offsetHeight
 * @param viewport window.innerHeight
 */
export function pinProgress(top: number, height: number, viewport: number): number {
  const total = height - Math.min(viewport, height)
  if (total <= 0) return 0
  return clamp01(-top / total)
}

/** 핵심 성과 i번째 카드의 채움 정도 — 카드마다 0.19 씩 늦게 시작해 0.14 구간 동안 채워진다 */
export function kpiPhase(p: number, index: number): number {
  return easeOut(clamp01((p - index * 0.19) / 0.14))
}

export function interpolate(from: number, to: number, q: number): number {
  return from + (to - from) * q
}

export function formatCounter(value: number, decimals: number, unit: string): string {
  return `${value.toFixed(decimals)}${unit}`
}

export interface ProjectStage {
  /** 현재 보이는 프로젝트 인덱스 (0 … count-1) */
  index: number
  /** 재생된 단계 수 - 1 (0 … 3) — 문제/판단/실행/결과 */
  step: number
}

/**
 * 프로젝트 섹션 진행률 → (프로젝트, 단계). 구간을 count 등분하고, 각 구간 안에서 4단계를
 * 4.4 배속으로 재생해 마지막 단계가 끝난 뒤 잠시 머무는 hold 구간을 남긴다.
 */
export function projectStage(p: number, count: number): ProjectStage {
  if (count <= 0) return { index: 0, step: 0 }
  const scaled = clamp01(p) * count
  const index = Math.min(count - 1, Math.floor(scaled))
  const step = Math.min(3, Math.floor((scaled - index) * 4.4))
  return { index, step }
}

/** 목록 클릭 → i번째 프로젝트 시작 지점의 문서 스크롤 위치 */
export function projectScrollTop(
  sectionTop: number,
  height: number,
  viewport: number,
  index: number,
  count: number
): number {
  const total = height - Math.min(viewport, height)
  return sectionTop + (index / count) * total + 2
}

export type SectionIntersection<T extends string> = { id: T; isIntersecting: boolean }

/** 레일 스크롤스파이 — 뷰포트 중앙 띠와 교차 중인 섹션이 활성. 교차 항목이 없으면 현재 값 유지 */
export function pickActiveSection<T extends string>(
  current: T,
  entries: SectionIntersection<T>[]
): T {
  let active = current
  for (const entry of entries) {
    if (entry.isIntersecting) active = entry.id
  }
  return active
}
