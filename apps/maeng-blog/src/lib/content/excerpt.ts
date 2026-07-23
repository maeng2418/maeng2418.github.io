// 목록 카드용 발췌 — 마크다운 문법을 제거한 평문 앞부분

const EXCERPT_LENGTH = 160

export function buildExcerpt(markdown: string, length: number = EXCERPT_LENGTH): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ') // 코드 블록
    .replace(/\$\$[\s\S]*?\$\$/g, ' ') // 블록 수식
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 이미지
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 링크 → 텍스트
    .replace(/<[^>]+>/g, ' ') // 인라인 HTML
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // 헤딩 마커
    .replace(/^\s{0,3}[-*+]\s+/gm, '') // 리스트 마커
    .replace(/^\s{0,3}>\s?/gm, '') // 인용 마커
    .replace(/[*_`~|]/g, '') // 강조/테이블 잔여 문법
    .replace(/\$([^$\n]+)\$/g, '$1') // 인라인 수식 구분자
    .replace(/\s+/g, ' ')
    .trim()

  if (plain.length <= length) return plain
  return `${plain.slice(0, length).trimEnd()}…`
}
