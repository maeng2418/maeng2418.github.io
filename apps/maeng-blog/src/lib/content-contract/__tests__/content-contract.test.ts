// SPEC-MAENGV2-EDITOR-MERGE-006 AC-M1-002/003/005 — 콘텐츠 계약 라운드트립 (TDD RED→GREEN)
// 교차 검증: maeng-blog 실 픽스처(content/markdowns/**)를 read-only 로 읽어
// 파싱→직렬화→재파싱 라운드트립이 blog loader 계약(parseLenientDate/gray-matter)을 보존함을 검증.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'
import { parseLenientDate } from '@/lib/content-contract/date'
import { parsePostMarkdown, serializePostMarkdown } from '@/lib/content-contract/frontmatter'
import { buildMarkdownKey, parseMarkdownKey } from '@/lib/content-contract/keys'
import { CONTRACT_KEYS } from '@/lib/content-contract/types'

// blog 실콘텐츠 디렉터리 (병합 이후 동일 앱 내부 — apps/maeng-blog/content/markdowns)
const BLOG_MARKDOWNS_DIR = path.resolve(__dirname, '../../../../content/markdowns')

function listBlogFixtures(): string[] {
  return fs
    .readdirSync(BLOG_MARKDOWNS_DIR, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => path.join(e.parentPath, e.name))
}

describe('parseLenientDate (blog date.ts 의미 동치)', () => {
  it('레거시 비표준 포맷(월/일 한 자리)을 파싱한다 — 2021-5-23 09:47:12', () => {
    const d = parseLenientDate('2021-5-23 09:47:12')
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2021, 4, 23])
    expect([d.getHours(), d.getMinutes(), d.getSeconds()]).toEqual([9, 47, 12])
  })

  it('시간 없는 날짜 / ISO / Date 인스턴스를 수용한다', () => {
    expect(parseLenientDate('2026-07-01').getFullYear()).toBe(2026)
    expect(parseLenientDate('2024-03-10T12:00:00').getHours()).toBe(12)
    const now = new Date(2025, 0, 15)
    expect(parseLenientDate(now).getTime()).toBe(now.getTime())
  })

  it('파싱 불가능한 값은 값을 포함해 에러를 던진다', () => {
    expect(() => parseLenientDate('not-a-date')).toThrow(/not-a-date/)
  })
})

describe('serializePostMarkdown — 정확히 5-키 계약 (REQ-MERGE-004)', () => {
  const fm = {
    title: '테스트 포스트',
    date: '2026-07-24 10:30:00',
    category: 'Development',
    thumbnail: '../../images/test.png',
    draft: false,
  }

  it('gray-matter 가 계약 키만을 정확히 파싱한다', () => {
    const md = serializePostMarkdown(fm, '본문입니다.\n')
    const { data, content } = matter(md)
    expect(Object.keys(data).sort()).toEqual(
      [...CONTRACT_KEYS].sort().filter((k) => k in data === true)
    )
    expect(Object.keys(data).every((k) => (CONTRACT_KEYS as readonly string[]).includes(k))).toBe(
      true
    )
    expect(data.title).toBe(fm.title)
    expect(String(data.date)).toContain('2026')
    expect(data.category).toBe(fm.category)
    expect(data.thumbnail).toBe(fm.thumbnail)
    expect(data.draft).toBe(false)
    expect(content.trim()).toBe('본문입니다.')
  })

  it('thumbnail/draft 미지정 시 키 자체를 생략한다 (blog: 키 부재 = 게시 상태)', () => {
    const md = serializePostMarkdown({ title: 't', date: '2026-07-24', category: 'C' }, 'b')
    const { data } = matter(md)
    expect('thumbnail' in data).toBe(false)
    expect('draft' in data).toBe(false)
  })

  it('특수문자(콜론/따옴표/한글) 타이틀이 손실 없이 라운드트립된다', () => {
    const tricky = `문자: "인용"과 'and' #해시 — 콜론: 포함`
    const md = serializePostMarkdown({ title: tricky, date: '2026-07-24', category: 'C' }, 'b')
    expect(matter(md).data.title).toBe(tricky)
  })

  it('계약 외 키는 직렬화되지 않는다 (추가 필드 금지)', () => {
    const withExtra = {
      title: 't',
      date: '2026-07-24',
      category: 'C',
      extra: 'nope',
    } as unknown as Parameters<typeof serializePostMarkdown>[0]
    const md = serializePostMarkdown(withExtra, 'b')
    expect('extra' in matter(md).data).toBe(false)
  })
})

describe('parsePostMarkdown ↔ serializePostMarkdown 라운드트립 (AC-M1-003)', () => {
  it('load → edit → save 시나리오에서 frontmatter 계약이 보존된다', () => {
    const original = serializePostMarkdown(
      {
        title: '라운드트립',
        date: '2021-5-23 09:47:12',
        category: 'NodeJS',
        thumbnail: '../../images/NodeJS.png',
        draft: true,
      },
      '# 헤딩\n\n본문\n'
    )
    const parsed = parsePostMarkdown(original)
    const reserialized = serializePostMarkdown(parsed.frontmatter, parsed.body)
    const reparsed = parsePostMarkdown(reserialized)

    expect(reparsed.frontmatter).toEqual(parsed.frontmatter)
    expect(reparsed.body).toBe(parsed.body)
    expect(reparsed.date.getTime()).toBe(parsed.date.getTime())
    // 비표준 날짜의 시각 의미 보존 (blog parseLenientDate 계약)
    expect(reparsed.date.getMonth()).toBe(4)
    expect(reparsed.date.getSeconds()).toBe(12)
  })
})

describe('blog 픽스처 교차 검증 (AC-M1-002 verbatim)', () => {
  it('blog 픽스처 전건(4건 이상)을 에러 없이 파싱한다', () => {
    const fixtures = listBlogFixtures()
    expect(fixtures.length).toBeGreaterThanOrEqual(4)
    for (const file of fixtures) {
      const parsed = parsePostMarkdown(fs.readFileSync(file, 'utf8'))
      expect(parsed.frontmatter.title).toBeTruthy()
      expect(parsed.frontmatter.category).toBeTruthy()
      expect(Number.isNaN(parsed.date.getTime())).toBe(false)
    }
  })

  it('픽스처 재직렬화 결과를 blog loader 방식(gray-matter+parseLenientDate)이 동일 의미로 인제스트한다', () => {
    for (const file of listBlogFixtures()) {
      const raw = fs.readFileSync(file, 'utf8')
      const parsed = parsePostMarkdown(raw)
      const emitted = serializePostMarkdown(parsed.frontmatter, parsed.body)

      // blog loader 시뮬레이션: gray-matter 파싱 + parseLenientDate + draft === true 판정
      const { data, content } = matter(emitted)
      const blogSide = matter(raw)

      expect(String(data.title ?? '').trim()).toBe(String(blogSide.data.title ?? '').trim())
      expect(String(data.category ?? '').trim()).toBe(String(blogSide.data.category ?? '').trim())
      expect(parseLenientDate(data.date as string | Date).getTime()).toBe(
        parseLenientDate(blogSide.data.date as string | Date).getTime()
      )
      expect(data.draft === true).toBe(blogSide.data.draft === true)
      expect((data.thumbnail ?? null) === null).toBe((blogSide.data.thumbnail ?? null) === null)
      expect(content.trim()).toBe(blogSide.content.trim())
    }
  })
})

describe('markdowns/{category}/ 키 레이아웃 헬퍼', () => {
  it('buildMarkdownKey 가 레이아웃 키를 생성한다', () => {
    expect(buildMarkdownKey('nodejs', 'debugging')).toBe('markdowns/nodejs/debugging.md')
    expect(buildMarkdownKey('nodejs', 'debugging.md')).toBe('markdowns/nodejs/debugging.md')
  })

  it('prefix 를 앞에 결합한다', () => {
    expect(buildMarkdownKey('dev', 'a', 'bucket-prefix')).toBe('bucket-prefix/markdowns/dev/a.md')
    expect(buildMarkdownKey('dev', 'a', 'bucket-prefix/')).toBe('bucket-prefix/markdowns/dev/a.md')
  })

  it('경로 조작 문자(../, 슬래시)를 거부한다 (AC-M1-005, REQ-STORE-007)', () => {
    expect(() => buildMarkdownKey('../etc', 'x')).toThrow()
    expect(() => buildMarkdownKey('dev', 'a/b')).toThrow()
    expect(() => buildMarkdownKey('dev', 'a\\b')).toThrow()
    expect(() => buildMarkdownKey('', 'x')).toThrow()
  })

  it('parseMarkdownKey 가 키를 category/fileName 으로 역파싱한다 (라운드트립)', () => {
    expect(parseMarkdownKey('markdowns/nodejs/debugging.md')).toEqual({
      category: 'nodejs',
      fileName: 'debugging',
    })
    expect(parseMarkdownKey('prefix/markdowns/dev/a.md', 'prefix')).toEqual({
      category: 'dev',
      fileName: 'a',
    })
    expect(parseMarkdownKey('images/x.png')).toBeNull()
  })
})

describe('CONTRACT_KEYS — 계약 키 개수 (AC-M1-004)', () => {
  it('계약 키가 정확히 5개다', () => {
    expect(CONTRACT_KEYS.length).toBe(5)
    expect([...CONTRACT_KEYS]).toEqual(['title', 'date', 'category', 'thumbnail', 'draft'])
  })
})
