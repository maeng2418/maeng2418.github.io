// 관대한 날짜 파싱 — 레거시 frontmatter 실측 `2021-5-23 09:47:12` (월/일 한 자리) 수용.
// YAML 파서가 이미 Date 로 변환한 값도 그대로 수용한다 (js-yaml 은 YAML 1.1 timestamp 를
// Date 로 파싱할 수 있다). 파싱 불가 시 SPEC ④ 대량 이관 때 진단 가능하도록 값을 포함해 던진다.

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

/** `YYYY. MM. DD` — 디자인 시안 캡션 포맷 (예: 2026. 07. 23) */
export function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())}`
}
