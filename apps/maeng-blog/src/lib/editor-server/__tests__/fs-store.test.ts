// fs 드라이버 — SPEC-MAENGV2-EDITOR-MERGE-006 AC-M3-009 (로컬 fs 동작), AC-M3-018/E-8 (Workers 부재 시 명시적 오류)
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PostNotFoundError } from '@/lib/editor-server/store/types'

let tmpRoot: string

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'maeng-fs-store-'))
})

afterEach(async () => {
  await fs.rm(tmpRoot, { recursive: true, force: true })
})

describe('createFsPostStore (AC-M3-009)', () => {
  it('list/load/save 가 content/markdowns/** 에 직접 반영된다', async () => {
    const { createFsPostStore } = await import('@/lib/editor-server/store/fs-store')
    const store = createFsPostStore({ contentDir: tmpRoot })

    const saveResult = await store.save({
      category: 'nodejs',
      fileName: 'new-post',
      frontmatter: { title: '새 글', category: 'nodejs', date: '2026-07-26 10:00:00' },
      body: '# 본문\n',
    })
    expect(saveResult.key).toBe('nodejs/new-post')

    const filePath = path.join(tmpRoot, 'markdowns', 'nodejs', 'new-post.md')
    const raw = await fs.readFile(filePath, 'utf8')
    expect(raw).toContain("title: '새 글'")

    const loaded = await store.load('nodejs', 'new-post')
    expect(loaded.frontmatter.title).toBe('새 글')
    expect(loaded.body.trim()).toBe('# 본문')

    const list = await store.list()
    expect(list).toEqual([
      expect.objectContaining({ key: 'nodejs/new-post', category: 'nodejs', fileName: 'new-post' }),
    ])
  })

  it('존재하지 않는 포스트 로드 시 PostNotFoundError 를 던진다', async () => {
    const { createFsPostStore } = await import('@/lib/editor-server/store/fs-store')
    const store = createFsPostStore({ contentDir: tmpRoot })
    await expect(store.load('nodejs', 'missing')).rejects.toBeInstanceOf(PostNotFoundError)
  })

  it('경로 이탈 카테고리/파일명은 assertSafeSegment 에 의해 거부된다 (REQ-STORE-007)', async () => {
    const { createFsPostStore } = await import('@/lib/editor-server/store/fs-store')
    const store = createFsPostStore({ contentDir: tmpRoot })
    await expect(store.load('../etc', 'passwd')).rejects.toThrow()
  })
})

describe('createFsImageStore (AC-M3-004)', () => {
  it('이미지가 content/images/ 에 고유 파일명으로 저장되고 /content-images/ 경로를 반환한다', async () => {
    const { createFsImageStore } = await import('@/lib/editor-server/store/fs-store')
    const store = createFsImageStore({ contentDir: tmpRoot })
    const result = await store.put({
      fileName: 'upload.png',
      contentType: 'image/png',
      buffer: Buffer.from([1, 2, 3]),
    })
    expect(result.path).toMatch(/^\/content-images\/[0-9a-f-]{36}\.png$/)
    const files = await fs.readdir(path.join(tmpRoot, 'images'))
    expect(files).toHaveLength(1)
  })
})

describe('Workers 런타임 부재 시 명시적 오류 (AC-M3-018, E-8)', () => {
  it('process.versions.node 가 없으면 fs 드라이버 생성이 식별 가능한 메시지와 함께 throw 한다', async () => {
    const originalVersions = process.versions
    // Workers 런타임 모사 — process.versions.node 부재
    Object.defineProperty(process, 'versions', {
      value: { ...originalVersions, node: undefined },
      configurable: true,
    })
    try {
      const { createFsPostStore } = await import('@/lib/editor-server/store/fs-store')
      expect(() => createFsPostStore({ contentDir: tmpRoot })).toThrow(/Node\.js filesystem/)
    } finally {
      Object.defineProperty(process, 'versions', { value: originalVersions, configurable: true })
    }
  })
})
