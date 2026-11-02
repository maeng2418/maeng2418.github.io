// 핀 구간 높이 단일 정의 지점 — 시안 v18 (D안 v2 문법)
// 각 핀 섹션은 이 높이만큼 스크롤하는 동안 무대(.pf-stage)가 고정되고, 스크롤 진행률 --p(0→1)이
// 리빌·카운터·프로젝트 단계 재생을 구동한다. 높이 조정은 반드시 이 모듈에서만 수행한다.

/** 핀 섹션별 스크롤 구간 높이 (px — 시안 수치 그대로) */
export const PIN_HEIGHTS_PX = {
  /** 히어로 단어 리빌 */
  top: 1500,
  /** 핵심 성과 카드 5장 + 카운터 */
  kpi: 2200,
  /** 경력 3건 — 선이 그려지며 등장 */
  career: 1300,
  /** 주요 프로젝트 6건 × 4단계 */
  work: 4800,
} as const

export type PinSection = keyof typeof PIN_HEIGHTS_PX

/** 핀 컨테이너 인라인 스타일용 CSS 길이 문자열 */
export function pinHeight(section: PinSection): string {
  return `${PIN_HEIGHTS_PX[section]}px`
}
