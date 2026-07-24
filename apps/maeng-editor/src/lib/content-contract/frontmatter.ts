// frontmatter 직렬화/파싱 — REQ-EDITOR-003 (blog loader 무변환 인제스트 계약)
// 파싱은 blog loader 와 동일하게 gray-matter 를 사용하고, 직렬화는 계약 5-키를
// 결정적 순서(title/date/category/thumbnail/draft)로 직접 방출한다 (추가 필드 금지).
import matter from 'gray-matter'
import { formatFrontmatterDate, parseLenientDate } from './date'
import type { ParsedPost, PostFrontmatter } from './types'

// @MX:ANCHOR: [AUTO] 에디터 저장 경로의 단일 직렬화 지점 — 저장(M4)/미리보기 동기화(M6)/라운드트립 테스트가 모두 이 함수를 소비
// @MX:REASON: 여기서 방출되는 frontmatter 가 blog loader 계약(정확히 5-키, gray-matter 파싱 가능)을 깨면 블로그 전 표면의 인제스트가 회귀한다
export function serializePostMarkdown(frontmatter: PostFrontmatter, body: string): string {
  const lines: string[] = [
    `title: ${yamlQuote(frontmatter.title)}`,
    `date: ${yamlQuote(frontmatter.date)}`,
    `category: ${yamlQuote(frontmatter.category)}`,
  ]
  if (frontmatter.thumbnail !== undefined && frontmatter.thumbnail !== '') {
    lines.push(`thumbnail: ${yamlQuote(frontmatter.thumbnail)}`)
  }
  if (frontmatter.draft !== undefined) {
    lines.push(`draft: ${frontmatter.draft ? 'true' : 'false'}`)
  }

  // 선행 개행 제거로 parse↔serialize 왕복 시 본문이 개행 누적 없이 고정점에 수렴한다
  const trimmedBody = body.replace(/^\n+/, '').replace(/\s+$/, '')
  return `---\n${lines.join('\n')}\n---\n\n${trimmedBody}\n`
}

export function parsePostMarkdown(raw: string): ParsedPost {
  const { data, content } = matter(raw)

  const title = String(data.title ?? '').trim()
  const category = String(data.category ?? '').trim()
  if (!title) throw new Error('frontmatter contract violation: missing "title"')
  if (!category) throw new Error('frontmatter contract violation: missing "category"')
  if (data.date === undefined || data.date === null) {
    throw new Error('frontmatter contract violation: missing "date"')
  }

  // js-yaml 이 YAML 1.1 timestamp 로 Date 를 만들었든 문자열이든 동일 시점으로 정규화한다.
  const date = parseLenientDate(data.date as string | Date)

  const frontmatter: PostFrontmatter = {
    title,
    date: formatFrontmatterDate(date),
    category,
  }
  if (data.thumbnail !== undefined && data.thumbnail !== null && data.thumbnail !== '') {
    frontmatter.thumbnail = String(data.thumbnail)
  }
  if ('draft' in data && data.draft !== undefined && data.draft !== null) {
    frontmatter.draft = data.draft === true
  }

  return { frontmatter, body: content, date }
}

/** YAML 단일 인용 스칼라 — 내부 작은따옴표는 '' 로 이스케이프 (레거시 픽스처 표기 관례) */
function yamlQuote(value: string): string {
  return `'${String(value).replace(/'/g, "''")}'`
}
