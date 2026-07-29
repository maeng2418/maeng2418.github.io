// SPEC-MAENGV2-PORTFOLIO-SCROLL-007 — 핀 높이 단일 정의(pin-config) 단위 테스트
// AC-M2-001/002: 인라인 vh 하드코딩을 대체하는 단일 정의 지점 검증
import { describe, expect, it } from 'vitest'
import { PIN_HEIGHTS_VH, pinHeight } from '@/components/portfolio/pin-config'

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
