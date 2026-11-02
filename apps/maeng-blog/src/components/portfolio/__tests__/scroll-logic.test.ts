// 스크롤 스크럽 순수 로직 + 핀 높이 단일 정의 단위 테스트 (시안 v18)
import { describe, expect, it } from 'vitest'
import { PIN_HEIGHTS_PX, pinHeight } from '@/components/portfolio/pin-config'
import {
  clamp01,
  easeOut,
  formatCounter,
  interpolate,
  kpiPhase,
  pickActiveSection,
  pinProgress,
  projectScrollTop,
  projectStage,
} from '@/components/portfolio/scroll-logic'

describe('pin-config — 핀 구간 높이 (시안 수치)', () => {
  it('핀 4곳의 높이가 시안(1500/2200/1300/4800px)과 동일하다', () => {
    expect(PIN_HEIGHTS_PX).toEqual({ top: 1500, kpi: 2200, career: 1300, work: 4800 })
  })

  it('pinHeight 가 px 길이 문자열을 파생한다', () => {
    expect(pinHeight('top')).toBe('1500px')
    expect(pinHeight('work')).toBe('4800px')
  })

  it('모든 핀 높이는 한 뷰포트(720px 무대)보다 커서 스크럽 구간이 성립한다', () => {
    for (const px of Object.values(PIN_HEIGHTS_PX)) expect(px).toBeGreaterThan(720)
  })
})

describe('pinProgress — 핀 진행률', () => {
  it('섹션 상단이 뷰포트 상단에 닿으면 0, 하단이 맞물리면 1', () => {
    expect(pinProgress(0, 1500, 900)).toBe(0)
    expect(pinProgress(-600, 1500, 900)).toBe(1)
    expect(pinProgress(-300, 1500, 900)).toBeCloseTo(0.5)
  })

  it('범위 밖은 0..1 로 클램프되고, 뷰포트보다 짧은 섹션은 0', () => {
    expect(pinProgress(400, 1500, 900)).toBe(0)
    expect(pinProgress(-2000, 1500, 900)).toBe(1)
    expect(pinProgress(-100, 500, 900)).toBe(0)
  })
})

describe('projectStage — 진행률 → (프로젝트, 단계)', () => {
  it('6등분 구간 안에서 4단계를 재생하고 마지막엔 머문다', () => {
    expect(projectStage(0, 6)).toEqual({ index: 0, step: 0 })
    expect(projectStage(1 / 6 + 0.001, 6)).toEqual({ index: 1, step: 0 })
    expect(projectStage(0.5 / 6, 6)).toEqual({ index: 0, step: 2 })
    expect(projectStage(0.9 / 6, 6)).toEqual({ index: 0, step: 3 })
    expect(projectStage(1, 6)).toEqual({ index: 5, step: 3 })
  })

  it('count 0 은 안전하게 (0,0)', () => {
    expect(projectStage(0.5, 0)).toEqual({ index: 0, step: 0 })
  })
})

describe('카운터 보간', () => {
  it('kpiPhase 는 카드마다 0.19 늦게 시작하고 0.14 구간 안에 완료된다', () => {
    expect(kpiPhase(0, 0)).toBe(0)
    expect(kpiPhase(0.14, 0)).toBe(1)
    expect(kpiPhase(0.14, 1)).toBe(0)
    expect(kpiPhase(0.19 + 0.14, 1)).toBe(1)
  })

  it('easeOut / clamp01 / interpolate / formatCounter', () => {
    expect(easeOut(0)).toBe(0)
    expect(easeOut(1)).toBe(1)
    expect(easeOut(0.5)).toBeGreaterThan(0.5)
    expect(clamp01(-1)).toBe(0)
    expect(clamp01(2)).toBe(1)
    expect(interpolate(100, 1.1, 0)).toBe(100)
    expect(interpolate(100, 1.1, 1)).toBeCloseTo(1.1)
    expect(formatCounter(589.24, 2, 's')).toBe('589.24s')
    expect(formatCounter(interpolate(3.4, 1.5, 1), 1, 'MB')).toBe('1.5MB')
  })
})

describe('projectScrollTop — 목록 클릭 이동 위치', () => {
  it('i번째 프로젝트 구간 시작 + 2px', () => {
    // 섹션 top 1000, 높이 4800, 뷰포트 900 → 스크럽 총량 3900
    expect(projectScrollTop(1000, 4800, 900, 0, 6)).toBe(1002)
    expect(projectScrollTop(1000, 4800, 900, 3, 6)).toBe(1000 + 1950 + 2)
  })
})

describe('pickActiveSection — 레일 스크롤스파이', () => {
  it('교차 중인 섹션을 활성으로, 없으면 현재 값을 유지한다', () => {
    expect(
      pickActiveSection('top', [
        { id: 'kpi', isIntersecting: true },
        { id: 'top', isIntersecting: false },
      ])
    ).toBe('kpi')
    expect(pickActiveSection('work', [{ id: 'work', isIntersecting: false }])).toBe('work')
  })
})
