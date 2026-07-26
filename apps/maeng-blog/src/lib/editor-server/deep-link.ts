// 에디터 딥링크 경로 파싱 — SPEC-MAENGV2-EDITOR-MERGE-006 M3 (design.md §B D9, REQ-EDIT-006)
import { assertSafeSegment } from '@/lib/content-contract/keys'

export class InvalidDeepLinkPathError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidDeepLinkPathError'
  }
}

export interface DeepLinkTarget {
  category: string
  fileName: string
}

// @MX:ANCHOR: [AUTO] 딥링크 경로 검증의 유일한 지점 — assertSafeSegment 를 재사용한다
// @MX:REASON: 딥링크 전용 검증 경로를 신설하면 REQ-STORE-007 경로 이탈 방어와 한쪽만 강화되는 회귀가 생긴다(design.md §B D9)
export function parseDeepLinkPath(raw: string): DeepLinkTarget {
  const segments = raw.split('/')
  if (segments.length !== 2 || segments.some((s) => s.length === 0)) {
    throw new InvalidDeepLinkPathError(
      `invalid deep-link path "${raw}": expected exactly 2 segments {category}/{fileName}`
    )
  }
  const [category, fileName] = segments
  assertSafeSegment('category', category)
  assertSafeSegment('fileName', fileName)
  return { category, fileName }
}
