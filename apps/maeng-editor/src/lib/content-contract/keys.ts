// S3/로컬 키 레이아웃 헬퍼 — legacy maeng-bucket 구조 미러 (REQ-EDITOR-003/004)
// 파일 경로 계약: markdowns/{category}/{fileName}.md (blog loader 디렉터리 계약과 동일)

const MARKDOWNS_SEGMENT = 'markdowns'

function assertSafeSegment(name: string, value: string): void {
  if (!value || value !== value.trim()) {
    throw new Error(`invalid ${name}: "${value}" (empty or padded)`)
  }
  if (/[/\\]/.test(value) || value === '.' || value === '..' || value.includes('..')) {
    throw new Error(`invalid ${name}: "${value}" (path traversal characters not allowed)`)
  }
}

/** `{prefix?}/markdowns/{category}/{fileName}.md` 키 생성 (prefix = AWS_BUCKET_MARKDOWN_FOLDER_PREFIX) */
export function buildMarkdownKey(category: string, fileName: string, prefix?: string): string {
  const base = fileName.endsWith('.md') ? fileName.slice(0, -3) : fileName
  assertSafeSegment('category', category)
  assertSafeSegment('fileName', base)

  const key = `${MARKDOWNS_SEGMENT}/${category}/${base}.md`
  const cleanPrefix = (prefix ?? '').replace(/\/+$/, '')
  return cleanPrefix ? `${cleanPrefix}/${key}` : key
}

/** `{prefix?}/markdowns/` 목록 조회용 prefix (ListObjectsV2 Prefix 인자) */
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
