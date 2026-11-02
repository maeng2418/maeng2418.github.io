// 포트폴리오 — 섹션 인벤토리(7종) 렌더 + 로케일별 다운로드 href 분기 + 콘텐츠 실데이터 (시안 v18)
// 로케일 상태는 LocaleProvider(next-intl) 가 공급 — 렌더는 프로바이더 래핑으로 갱신
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import LocaleProvider from '@/components/i18n/LocaleProvider'
import PortfolioScroll from '@/components/portfolio/PortfolioScroll'
import {
  KPI_VISUALS,
  PORTFOLIO_SECTION_IDS,
  getPortfolioContent,
  getResumeHref,
} from '@/lib/portfolio/content'
import type { Locale } from '@/lib/i18n/locale'

function renderPortfolio(initialLocale?: Locale) {
  return renderToStaticMarkup(
    createElement(LocaleProvider, {
      initialLocale,
      children: createElement(PortfolioScroll),
    })
  )
}

describe('섹션 인벤토리 (시안 v18 — 핀 4 + 흐름 3)', () => {
  it('7개 섹션 id 를 시안 순서대로 정의한다', () => {
    expect([...PORTFOLIO_SECTION_IDS]).toEqual([
      'top',
      'kpi',
      'career',
      'work',
      'skills',
      'standards',
      'more',
    ])
  })

  it('렌더 마크업에 7개 섹션과 레일 점 7개가 모두 존재한다', () => {
    const html = renderPortfolio()
    for (const id of PORTFOLIO_SECTION_IDS) {
      expect(html, `data-section="${id}" 누락`).toContain(`data-section="${id}"`)
      expect(html, `레일 #pf-${id} 누락`).toContain(`href="#pf-${id}"`)
    }
  })

  it('핀 4곳은 data-pin 과 px 높이를 갖고, 흐름 3곳은 핀이 아니다', () => {
    const html = renderPortfolio()
    for (const id of ['top', 'kpi', 'career', 'work']) {
      expect(html).toContain(`data-pin="${id}"`)
    }
    expect(html).not.toContain('data-pin="skills"')
    expect(html.match(/data-pin=/g)).toHaveLength(4)
  })
})

describe('초기 렌더 상태 (SSR — 스크롤 전)', () => {
  it('첫 프로젝트만 is-on 이고, 각 프로젝트는 첫 단계(문제)만 재생돼 있다', () => {
    const html = renderPortfolio()
    expect(html.match(/pf-proj is-on/g)).toHaveLength(1)
    expect(html.match(/pf-step is-on/g)).toHaveLength(6) // 프로젝트당 1단계
    expect(html).not.toContain('pf-step is-on is-last')
    expect(html).toContain('01 / 06')
  })

  it('카운터는 시작값(100% / 589.24s / 3.4MB)으로 렌더된다', () => {
    const html = renderPortfolio()
    expect(html).toContain('>100.0%<')
    expect(html).toContain('>589.24s<')
    expect(html).toContain('>3.4MB<')
  })
})

describe('로케일별 다운로드 href 분기', () => {
  it('getResumeHref: ko → /portfolio_ko.pdf, en → /portfolio_en.pdf', () => {
    expect(getResumeHref('ko')).toBe('/portfolio_ko.pdf')
    expect(getResumeHref('en')).toBe('/portfolio_en.pdf')
  })

  it('기본(ko) 렌더 시 다운로드 앵커가 /portfolio_ko.pdf 를 가리키고 국문 이름을 노출한다', () => {
    const html = renderPortfolio()
    expect(html).toContain('href="/portfolio_ko.pdf"')
    expect(html).toContain('href="/portfolio_en.pdf"') // PDF 카드의 반대 로케일 버튼
    expect(html).toContain('김명성')
    expect(html).toContain('이력서 PDF 다운로드')
  })

  it('en 렌더 시 영문 콘텐츠를 노출한다', () => {
    const html = renderPortfolio('en')
    expect(html).toContain('href="/portfolio_en.pdf"')
    expect(html).toContain('Myeongseong Kim')
    expect(html).toContain('Download résumé (PDF)')
  })
})

describe('로케일 리소스 실데이터 (portfolio_02 이력서 SSOT)', () => {
  it.each(['ko', 'en'] as const)('%s 콘텐츠가 전 섹션 실데이터를 갖는다', (locale) => {
    const c = getPortfolioContent(locale)
    expect(c.hero.words.length).toBeGreaterThanOrEqual(10)
    expect(c.hero.accentWord).toBeLessThan(c.hero.words.length)
    expect(c.hero.links).toHaveLength(3)
    expect(c.kpi.items).toHaveLength(KPI_VISUALS.length)
    expect(c.career.roles).toHaveLength(3)
    expect(c.work.items).toHaveLength(6)
    for (const project of c.work.items) expect(project.steps).toHaveLength(4)
    expect(c.work.stepLabels).toHaveLength(4)
    expect(c.skills.groups).toHaveLength(5)
    expect(c.standards.items).toHaveLength(3)
    expect(c.improvements.items).toHaveLength(4)
    expect(c.activities.items).toHaveLength(3)
    expect(c.education.term).toBe('2015.03 – 2021.02')
  })

  it('현재 소속(놀유니버스/NOL Universe)이 이력서 PDF 와 일치하고 재직중 표시가 있다', () => {
    expect(getPortfolioContent('ko').career.roles[0].company).toContain('놀유니버스')
    expect(getPortfolioContent('en').career.roles[0].company).toContain('NOL Universe')
    expect(getPortfolioContent('ko').career.roles[0].current).toBe(true)
  })

  it('핵심 성과 시각 요소의 수치가 시안과 일치한다', () => {
    expect(KPI_VISUALS[0]).toMatchObject({ kind: 'bars', from: 100, to: 1.1, bars: [100, 69.4, 22.3, 6.5, 1.1] })
    expect(KPI_VISUALS[1]).toMatchObject({ kind: 'line', from: 589.24, to: 1.1, unit: 's' })
    expect(KPI_VISUALS[2]).toMatchObject({ kind: 'line', from: 3.4, to: 1.5, unit: 'MB' })
  })
})
