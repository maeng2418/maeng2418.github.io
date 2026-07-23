// AC-BLOG-005 — TIL 페이지: date 내림차순 / 제목 / 표기 날짜 / 렌더된 본문 / 최신 항목 액센트
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import TilPage from '@/app/til/page'
import { getTilEntriesWithHtml } from '@/lib/content/loader'

describe('TIL 엔트리 데이터 (content/til/ 픽스처)', () => {
  it('date 내림차순으로 정렬된다', async () => {
    const entries = await getTilEntriesWithHtml()
    expect(entries.length).toBeGreaterThanOrEqual(2)
    const times = entries.map((e) => e.date.getTime())
    expect(times).toEqual([...times].sort((a, b) => b - a))
  })

  it('각 엔트리가 제목/표기 날짜/렌더된 본문을 갖는다', async () => {
    for (const entry of await getTilEntriesWithHtml()) {
      expect(entry.title).toBeTruthy()
      expect(entry.dateFormatted).toMatch(/^\d{4}\. \d{2}\. \d{2}$/)
      expect(entry.html).toMatch(/<(p|h\d|ul|ol|pre)[\s>]/)
    }
  })
})

describe('TIL 페이지 (세로 타임라인, design.md §3 + 승인 시안)', () => {
  it('전체 엔트리를 최신순으로 렌더한다', async () => {
    // async 서버 컴포넌트 — 호출 결과가 곧 ReactElement 트리
    const html = renderToStaticMarkup(await TilPage())
    const entries = await getTilEntriesWithHtml()
    let cursor = -1
    for (const entry of entries) {
      const idx = html.indexOf(entry.title)
      expect(idx, `"${entry.title}" 이 목록에 존재해야 한다`).toBeGreaterThan(cursor)
      cursor = idx
    }
  })

  it('최신 항목 1건만 액센트 표시(data-latest)한다', async () => {
    const html = renderToStaticMarkup(await TilPage())
    expect(html.match(/data-latest="true"/g)).toHaveLength(1)
    // 최신 항목이 문서 상단(첫 번째 리스트 항목)에 온다
    const firstLatest = html.indexOf('data-latest="true"')
    const anyOther = html.indexOf('data-latest="false"')
    expect(firstLatest).toBeGreaterThan(-1)
    expect(anyOther).toBeGreaterThan(firstLatest)
  })
})
