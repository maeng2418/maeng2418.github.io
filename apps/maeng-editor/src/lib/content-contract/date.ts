// 관대한 날짜 파싱 — blog SSOT(maeng-blog/src/lib/content/date.ts)와 의미 동치.
// 블로그 앱은 read-only(REQ-EDITOR-013)이고 워크스페이스 패키지가 아니므로 의미를 미러링하고,
// content-contract 테스트가 blog 실 픽스처로 교차 검증한다 (AC-EDITOR-003).

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
