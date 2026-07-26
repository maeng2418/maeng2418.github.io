// 딥링크 경로 파싱 — SPEC-MAENGV2-EDITOR-MERGE-006 AC-M3-017, REQ-EDIT-006 (design.md §B D9)
import { describe, expect, it } from 'vitest'
import { InvalidDeepLinkPathError, parseDeepLinkPath } from '@/lib/editor-server/deep-link'

describe('parseDeepLinkPath — 유효 입력', () => {
  it('{category}/{fileName} 2세그먼트를 파싱한다', () => {
    expect(parseDeepLinkPath('nodejs/debugging')).toEqual({ category: 'nodejs', fileName: 'debugging' })
  })
})

describe('parseDeepLinkPath — 무효 입력 거부 (AC-M3-017)', () => {
  it('세그먼트가 1개뿐이면 거부한다', () => {
    expect(() => parseDeepLinkPath('onlyonesegment')).toThrow(InvalidDeepLinkPathError)
  })

  it('세그먼트가 3개 이상이면 거부한다', () => {
    expect(() => parseDeepLinkPath('a/b/c')).toThrow(InvalidDeepLinkPathError)
  })

  it('경로 이탈 문자(../, 절대경로)를 거부한다 — assertSafeSegment 재사용 확인', () => {
    expect(() => parseDeepLinkPath('../../etc/passwd')).toThrow()
    expect(() => parseDeepLinkPath('../etc')).toThrow()
  })

  it('빈 세그먼트를 거부한다', () => {
    expect(() => parseDeepLinkPath('/fileName')).toThrow()
    expect(() => parseDeepLinkPath('category/')).toThrow()
  })
})
