// 포트폴리오 콘텐츠 접근자 — REQ-BLOG-006/007
// 콘텐츠 SSOT: src/locales/{ko,en}/portfolio.json (실제 이력서 PDF portfolio_{ko,en}.pdf 기반, design.md §4.5)
import type { Locale } from '@/lib/i18n/locale'
import en from '@/locales/en/portfolio.json'
import ko from '@/locales/ko/portfolio.json'
import type { PortfolioContent } from './types'

// @MX:ANCHOR: [AUTO] 레거시 12종 섹션 인벤토리 계약 — 페이지 렌더/테스트(AC-BLOG-006)가 이 목록을 소비
// @MX:REASON: REQ-BLOG-006의 "legacy section inventory"가 여기서 단일 정의된다. 항목 누락/개명 시 포트폴리오 페이지와 AC 검증이 동시에 회귀함
export const PORTFOLIO_SECTION_IDS = [
  'businessCard',
  'introduction',
  'techSkill',
  'softSkill',
  'designSkill',
  'skillSets',
  'projects',
  'timestamp',
  'experiences',
  'educations',
  'downloadButton',
  'translateButton',
] as const

export type PortfolioSectionId = (typeof PORTFOLIO_SECTION_IDS)[number]

const CONTENT: Record<Locale, PortfolioContent> = { ko, en }

export function getPortfolioContent(locale: Locale): PortfolioContent {
  return CONTENT[locale]
}

/** 로케일별 이력서 PDF 경로 — AC-BLOG-006 (public/portfolio_{ko,en}.pdf 배포 자산) */
export function getResumeHref(locale: Locale): string {
  return locale === 'ko' ? '/portfolio_ko.pdf' : '/portfolio_en.pdf'
}
