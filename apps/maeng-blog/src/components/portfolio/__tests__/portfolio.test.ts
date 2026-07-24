// AC-BLOG-006 — 포트폴리오: 12종 섹션 인벤토리 렌더 + 로케일별 다운로드 href 분기
// ENHANCE-005 M1: 로케일 상태는 LocaleProvider(next-intl) 가 공급 — 렌더는 프로바이더 래핑으로 갱신 (REQ-ENH-013)
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import LocaleProvider from '@/components/i18n/LocaleProvider'
import PortfolioScroll from '@/components/portfolio/PortfolioScroll'
import { PORTFOLIO_SECTION_IDS, getPortfolioContent, getResumeHref } from '@/lib/portfolio/content'
import type { Locale } from '@/lib/i18n/locale'

function renderPortfolio(initialLocale?: Locale) {
  return renderToStaticMarkup(
    createElement(LocaleProvider, {
      initialLocale,
      children: createElement(PortfolioScroll),
    })
  )
}

describe('섹션 인벤토리 (레거시 12종 — REQ-BLOG-006)', () => {
  it('12종 인벤토리를 정의한다 (콘텐츠 10종 + 다운로드/번역 버튼)', () => {
    expect(PORTFOLIO_SECTION_IDS).toHaveLength(12)
    expect([...PORTFOLIO_SECTION_IDS].sort()).toEqual(
      [
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
      ].sort()
    )
  })

  it('렌더 마크업에 12개 섹션이 모두 존재한다', () => {
    const html = renderPortfolio()
    for (const id of PORTFOLIO_SECTION_IDS) {
      expect(html, `data-section="${id}" 누락`).toContain(`data-section="${id}"`)
    }
  })
})

describe('모션 전환 (AC-ENH-008 — 수제 스태거 클래스 대체)', () => {
  it('pf-stagger 클래스 기반 수제 스태거 대신 motion variants 가 담당한다', () => {
    const html = renderPortfolio()
    expect(html).not.toContain('pf-stagger')
  })
})

describe('로케일별 다운로드 href 분기 (AC-BLOG-006)', () => {
  it('getResumeHref: ko → /portfolio_ko.pdf, en → /portfolio_en.pdf', () => {
    expect(getResumeHref('ko')).toBe('/portfolio_ko.pdf')
    expect(getResumeHref('en')).toBe('/portfolio_en.pdf')
  })

  it('기본(ko) 렌더 시 다운로드 앵커가 /portfolio_ko.pdf 를 가리킨다', () => {
    const html = renderPortfolio()
    expect(html).toContain('href="/portfolio_ko.pdf"')
    expect(html).toContain('김명성')
  })

  it('en 렌더 시 다운로드 앵커가 /portfolio_en.pdf 를 가리키고 영문 콘텐츠를 노출한다', () => {
    const html = renderPortfolio('en')
    expect(html).toContain('href="/portfolio_en.pdf"')
    expect(html).toContain('Myeongseong Kim')
  })
})

describe('로케일 리소스 실데이터 (design.md §4.5 — PDF/레거시 SSOT)', () => {
  it.each(['ko', 'en'] as const)('%s 콘텐츠가 전 섹션 실데이터를 갖는다', (locale) => {
    const c = getPortfolioContent(locale)
    expect(c.businessCard.name).toBeTruthy()
    expect(c.businessCard.contacts.length).toBeGreaterThanOrEqual(3)
    expect(c.introduction.values).toHaveLength(4)
    expect(c.techSkill.details.length).toBeGreaterThanOrEqual(5)
    expect(c.softSkill.details.length).toBeGreaterThanOrEqual(5)
    expect(c.designSkill.details.length).toBeGreaterThanOrEqual(2)
    expect(c.skillSets.groups.length).toBeGreaterThanOrEqual(5)
    expect(c.projects.items.length).toBeGreaterThanOrEqual(4)
    expect(c.timestamp.items.length).toBeGreaterThanOrEqual(8)
    expect(c.experiences.items).toHaveLength(3)
    expect(c.educations.items.length).toBeGreaterThanOrEqual(2)
  })

  it('현재 소속(놀유니버스/NOL Universe)이 이력서 PDF 와 일치한다', () => {
    expect(getPortfolioContent('ko').experiences.items[0].company).toContain('놀유니버스')
    expect(getPortfolioContent('en').experiences.items[0].company).toContain('NOL Universe')
  })
})
