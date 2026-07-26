// 콘텐츠 경로 키 레이아웃 헬퍼 — SPEC-MAENGV2-EDITOR-MERGE-006 REQ-MERGE-004 / REQ-STORE-007
// 파일 경로 계약: markdowns/{category}/{fileName}.md (blog loader 디렉터리 계약과 동일)
// assertSafeSegment 는 GitHub 커밋 경로(REQ-STORE-007)와 딥링크 경로(REQ-EDIT-006, D9)에서도
// 재사용되는 유일한 경로 이탈 방어 지점이다 — 별도 검증 경로를 신설하지 않는다(design.md §B D9).

const MARKDOWNS_SEGMENT = 'markdowns'

// @MX:ANCHOR: [AUTO] 경로 이탈 방어의 단일 지점 — GitHub 스토리지(M3)·딥링크(M3 deep-link)가 모두 이 함수를 소비
// @MX:REASON: 검증 지점이 둘로 갈라지면 한쪽만 강화되는 회귀가 발생한다(design.md §B D9)
export function assertSafeSegment(name: string, value: string): void {
  if (!value || value !== value.trim()) {
    throw new Error(`invalid ${name}: "${value}" (empty or padded)`)
  }
  if (/[/\\]/.test(value) || value === '.' || value === '..' || value.includes('..')) {
    throw new Error(`invalid ${name}: "${value}" (path traversal characters not allowed)`)
  }
}

/** `{prefix?}/markdowns/{category}/{fileName}.md` 키 생성 */
export function buildMarkdownKey(category: string, fileName: string, prefix?: string): string {
  const base = fileName.endsWith('.md') ? fileName.slice(0, -3) : fileName
  assertSafeSegment('category', category)
  assertSafeSegment('fileName', base)

  const key = `${MARKDOWNS_SEGMENT}/${category}/${base}.md`
  const cleanPrefix = (prefix ?? '').replace(/\/+$/, '')
  return cleanPrefix ? `${cleanPrefix}/${key}` : key
}

/** `{prefix?}/markdowns/` 목록 조회용 prefix */
export function buildMarkdownListPrefix(prefix?: string): string {
  const cleanPrefix = (prefix ?? '').replace(/\/+$/, '')
  return cleanPrefix ? `${cleanPrefix}/${MARKDOWNS_SEGMENT}/` : `${MARKDOWNS_SEGMENT}/`
}

/** 키 → {category, fileName} 역파싱. markdowns 레이아웃이 아니면 null */
export function parseMarkdownKey(
  key: string,
  prefix?: string
): { category: string; fileName: string } | null {
  let rest = key
  const cleanPrefix = (prefix ?? '').replace(/\/+$/, '')
  if (cleanPrefix) {
    if (!rest.startsWith(`${cleanPrefix}/`)) return null
    rest = rest.slice(cleanPrefix.length + 1)
  }

  const m = /^markdowns\/([^/]+)\/([^/]+)\.md$/.exec(rest)
  if (!m) return null
  return { category: m[1], fileName: m[2] }
}
