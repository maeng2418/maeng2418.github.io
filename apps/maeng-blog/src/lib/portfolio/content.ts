// 포트폴리오 콘텐츠 접근자 — 시안 v18
// 콘텐츠 SSOT: messages/{ko,en}.json 의 portfolio 네임스페이스 (next-intl 카탈로그 통합).
// 구조형 데이터(배열·중첩 객체)는 next-intl 의 t() 로 꺼내기 번거로워 타입 접근자로 직접 소비한다.
import type { Locale } from '@/lib/i18n/locale'
import en from '../../../messages/en.json'
import ko from '../../../messages/ko.json'
import type { PortfolioContent } from './types'

// @MX:ANCHOR: [AUTO] 섹션 인벤토리 계약 — 페이지 렌더(data-section)·레일 스크롤스파이·테스트가 이 순서를 공유
// @MX:REASON: 레일 점 7개와 섹션 id 가 이 목록에서 단일 정의된다. 항목 누락/개명 시 레일·테스트가 동시에 회귀함
export const PORTFOLIO_SECTION_IDS = [
  'top',
  'kpi',
  'career',
  'work',
  'skills',
  'standards',
  'more',
] as const

export type PortfolioSectionId = (typeof PORTFOLIO_SECTION_IDS)[number]

const CONTENT: Record<Locale, PortfolioContent> = {
  ko: ko.portfolio,
  en: en.portfolio,
}

export function getPortfolioContent(locale: Locale): PortfolioContent {
  return CONTENT[locale]
}

/** 로케일별 이력서 PDF 경로 — public/portfolio_{ko,en}.pdf 배포 자산 */
export function getResumeHref(locale: Locale): string {
  return locale === 'ko' ? '/portfolio_ko.pdf' : '/portfolio_en.pdf'
}

/** 핵심 성과 카드의 시각 요소 — 숫자는 로케일 무관이라 카탈로그가 아닌 코드에 둔다.
 *  bars: 연도별 막대 + 카운터 / line: 단일 게이지 + 카운터 / check: 체크 아이콘 */
export type KpiVisual =
  | { kind: 'bars'; from: number; to: number; decimals: number; unit: string; bars: number[]; labels: string[] }
  | { kind: 'line'; from: number; to: number; decimals: number; unit: string; barTo: number }
  | { kind: 'check' }

export const KPI_VISUALS: readonly KpiVisual[] = [
  {
    kind: 'bars',
    from: 100,
    to: 1.1,
    decimals: 1,
    unit: '%',
    bars: [100, 69.4, 22.3, 6.5, 1.1],
    labels: ['22', '23', '24', '25', '26'],
  },
  { kind: 'line', from: 589.24, to: 1.1, decimals: 2, unit: 's', barTo: 0.19 },
  { kind: 'line', from: 3.4, to: 1.5, decimals: 1, unit: 'MB', barTo: 44.1 },
  { kind: 'check' },
  { kind: 'check' },
]
