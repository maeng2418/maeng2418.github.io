// 읽기 시간 추정 — 목록 메타("Typescript · 2분")와 상세 헤더("읽기 2분")가 소비한다.
// 한글은 글자 단위(분당 500자), 그 외는 단어 단위(분당 200단어)로 세고 올림한다. 최소 1분.
// 코드 블록·수식·이미지·링크 URL 은 본문 읽기 부하가 아니므로 제외한다 (excerpt 와 동일 규칙).

const KOREAN_CHARS_PER_MINUTE = 500
const WORDS_PER_MINUTE = 200

export function stripMarkdownForReading(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 본문 글자 수 (공백 제외) — 상세 헤더 보조 메타 */
export function countCharacters(markdown: string): number {
  return stripMarkdownForReading(markdown).replace(/\s/g, '').length
}

export function estimateReadingMinutes(markdown: string): number {
  const plain = stripMarkdownForReading(markdown)
  const korean = (plain.match(/[ㄱ-ㆎ가-힣]/g) ?? []).length
  const words = plain
    .replace(/[ㄱ-ㆎ가-힣]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0).length
  const minutes = korean / KOREAN_CHARS_PER_MINUTE + words / WORDS_PER_MINUTE
  return Math.max(1, Math.ceil(minutes))
}
