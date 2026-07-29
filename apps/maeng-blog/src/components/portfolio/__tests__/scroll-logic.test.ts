// SPEC-MAENGV2-PORTFOLIO-SCROLL-007 — 핀 높이 단일 정의(pin-config) 단위 테스트
// AC-M2-001/002: 인라인 vh 하드코딩을 대체하는 단일 정의 지점 검증
import { describe, expect, it } from 'vitest'
import { PIN_HEIGHTS_VH, pinHeight } from '@/components/portfolio/pin-config'
import { computeRailMax, pickActiveChapter } from '@/components/portfolio/scroll-logic'

describe('pin-config — 핀 구간 높이 단일 정의 (REQ-PIN-002)', () => {
  it('4개 핀 섹션의 높이가 기존 값(240/300/330/220vh)과 동일하다', () => {
    expect(PIN_HEIGHTS_VH).toEqual({
      intro: 240,
      projects: 300,
      career: 330,
      contact: 220,
    })
  })

  it('pinHeight 가 CSS 길이 문자열을 파생한다', () => {
    expect(pinHeight('intro')).toBe('240vh')
    expect(pinHeight('projects')).toBe('300vh')
    expect(pinHeight('career')).toBe('330vh')
    expect(pinHeight('contact')).toBe('220vh')
  })
})

describe('computeRailMax — 수평 레일 최대 이동량 (REQ-RAIL-001..002)', () => {
  it('콘텐츠 폭이 래퍼 폭을 넘는 만큼을 반환한다', () => {
    expect(computeRailMax(1200, 800)).toBe(400)
  })

  it('콘텐츠가 래퍼보다 좁으면 0 (음수 이동 금지)', () => {
    expect(computeRailMax(500, 800)).toBe(0)
    expect(computeRailMax(0, 0)).toBe(0)
  })
})

describe('pickActiveChapter — 뷰포트 중앙선 교차 기반 활성 챕터 판정 (REQ-SCROLL-001..002)', () => {
  it('교차 중인 섹션의 인덱스를 반환한다', () => {
    expect(
      pickActiveChapter(0, [
        { index: 2, isIntersecting: true },
        { index: 1, isIntersecting: false },
      ])
    ).toBe(2)
  })

  it('교차 항목이 없으면 현재 값을 유지한다 (섹션 경계 통과 순간)', () => {
    expect(pickActiveChapter(3, [{ index: 3, isIntersecting: false }])).toBe(3)
  })

  it('복수 교차 시 마지막 교차 항목이 우선한다', () => {
    expect(
      pickActiveChapter(0, [
        { index: 1, isIntersecting: true },
        { index: 2, isIntersecting: true },
      ])
    ).toBe(2)
  })
})
