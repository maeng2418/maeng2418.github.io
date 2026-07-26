// GET/PUT /api/posts/[category]/[fileName] 라우트 핸들러 — SPEC-MAENGV2-EDITOR-MERGE-006
// AC-M3-015 (딥링크 로드), AC-M3-016 (동일 경로 저장), AC-M3-017 (무효 경로 4xx)
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GET, PUT } from '@/app/api/posts/[category]/[fileName]/route.server'
import { serializePostMarkdown } from '@/lib/content-contract/frontmatter'

let tmpRoot: string

function params(category: string, fileName: string) {
  return { params: Promise.resolve({ category, fileName }) }
}

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'maeng-posts-route-'))
  process.env.EDITOR_STORAGE_DRIVER = 'fs'
  process.env.MAENG_CONTENT_DIR = tmpRoot
  // M4 인증 게이트(requireEditorAuth) 우회 — 이 스위트는 딥링크 로드/저장 계약만 검증한다.
  process.env.EDITOR_AUTH_TOKEN = 'x'.repeat(32)
  process.env.EDITOR_AUTH_DISABLED = '1'
  await fs.mkdir(path.join(tmpRoot, 'markdowns', 'nodejs'), { recursive: true })
  await fs.writeFile(
    path.join(tmpRoot, 'markdowns', 'nodejs', 'existing.md'),
    serializePostMarkdown(
      { title: '원본 제목', category: 'nodejs', date: '2026-07-01 09:00:00' },
      '원본 본문\n'
    ),
    'utf8'
  )
})

afterEach(async () => {
  delete process.env.EDITOR_STORAGE_DRIVER
  delete process.env.MAENG_CONTENT_DIR
  delete process.env.EDITOR_AUTH_TOKEN
  delete process.env.EDITOR_AUTH_DISABLED
  await fs.rm(tmpRoot, { recursive: true, force: true })
})

describe('GET (딥링크 로드, AC-M3-015)', () => {
  it('기존 포스트를 원본 title/date/category 와 함께 로드한다', async () => {
    const response = await GET(new Request('http://localhost/api/posts/nodejs/existing'), params('nodejs', 'existing'))
    expect(response.status).toBe(200)
    const json = (await response.json()) as { frontmatter: { title: string } }
    expect(json.frontmatter.title).toBe('원본 제목')
  })

  it('존재하지 않는 포스트는 404 를 반환한다', async () => {
    const response = await GET(new Request('http://localhost/api/posts/nodejs/missing'), params('nodejs', 'missing'))
    expect(response.status).toBe(404)
  })

  it('경로 이탈 세그먼트는 400 을 반환한다 (AC-M3-017)', async () => {
    const response = await GET(new Request('http://localhost/api/posts/../etc/passwd'), params('..', 'passwd'))
    expect(response.status).toBe(400)
  })
})

describe('PUT (동일 경로 저장, AC-M3-016)', () => {
  it('URL 세그먼트가 결정한 경로로 저장되어 새 경로가 생성되지 않는다', async () => {
    const response = await PUT(
      new Request('http://localhost/api/posts/nodejs/existing', {
        method: 'PUT',
        body: JSON.stringify({
          title: '수정된 제목',
          category: 'nodejs',
          body: '수정된 본문\n',
          date: '2026-07-01 09:00:00',
        }),
      }),
      params('nodejs', 'existing')
    )
    expect(response.status).toBe(200)

    const files = await fs.readdir(path.join(tmpRoot, 'markdowns', 'nodejs'))
    expect(files).toEqual(['existing.md']) // 새 파일이 생성되지 않았다

    const raw = await fs.readFile(path.join(tmpRoot, 'markdowns', 'nodejs', 'existing.md'), 'utf8')
    expect(raw).toContain("title: '수정된 제목'")
  })

  it('본문 JSON 이 무효하면 400 을 반환한다', async () => {
    const response = await PUT(
      new Request('http://localhost/api/posts/nodejs/existing', { method: 'PUT', body: '{not json' }),
      params('nodejs', 'existing')
    )
    expect(response.status).toBe(400)
  })
})
