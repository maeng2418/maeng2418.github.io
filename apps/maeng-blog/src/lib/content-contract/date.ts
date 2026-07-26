// 관대한 날짜 파싱 — SPEC-MAENGV2-EDITOR-MERGE-006 REQ-MERGE-004
// blog 읽기 계층 SSOT(src/lib/content/date.ts)와 의미 동치.
// content-contract 테스트가 blog 실 픽스처로 교차 검증한다(AC-M1-002).

const LENIENT_DATE_RE =
  /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/

export function parseLenientDate(input: string | Date): Date {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) throw new Error(`Invalid Date object`)
    return input
  }

  const value = String(input).trim()
  const m = LENIENT_DATE_RE.exec(value)
  if (m) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = m
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  }

  const fallback = new Date(value)
  if (!Number.isNaN(fallback.getTime())) return fallback

  throw new Error(`Unparseable date value: "${value}"`)
}

/** frontmatter 재직렬화용 정규 표기 — 로컬 시각 `YYYY-MM-DD HH:mm:ss` */
export function formatFrontmatterDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}
