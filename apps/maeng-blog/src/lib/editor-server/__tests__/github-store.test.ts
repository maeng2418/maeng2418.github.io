// GitHub Contents API 드라이버 — SPEC-MAENGV2-EDITOR-MERGE-006
// AC-M3-002 (신규 저장 커밋), AC-M3-003 (갱신 시 sha 선조회), AC-M3-007 (순차 발행), AC-M3-018 계열
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { serializePostMarkdown } from '@/lib/content-contract/frontmatter'
import type { GitHubRuntimeEnv } from '@/lib/editor-server/env'
import { commitFiles } from '@/lib/editor-server/github'
import { createGitHubImageStore, createGitHubPostStore } from '@/lib/editor-server/store/github-store'
import { PostNotFoundError } from '@/lib/editor-server/store/types'

const env: GitHubRuntimeEnv = {
  token: 'test-token',
  owner: 'maeng2418',
  repo: 'maeng2418.github.io',
  branch: 'main',
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('createGitHubPostStore.save (AC-M3-002/003)', () => {
  it('신규 저장 시 sha 조회(404) 후 PUT 을 발행한다', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 })) // getFileSha
      .mockResolvedValueOnce(
        jsonResponse({
          content: { sha: 'blob-sha-1', path: 'apps/maeng-blog/content/markdowns/nodejs/new-post.md' },
          commit: { sha: 'commit-sha-1', html_url: 'https://github.com/x/y/commit/commit-sha-1' },
        })
      )

    const store = createGitHubPostStore(env)
    const result = await store.save({
      category: 'nodejs',
      fileName: 'new-post',
      frontmatter: { title: '새 글', category: 'nodejs', date: '2026-07-26 10:00:00' },
      body: '# 본문\n',
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [shaCall, putCall] = fetchMock.mock.calls
    expect(String(shaCall[0])).toContain(
      '/repos/maeng2418/maeng2418.github.io/contents/apps/maeng-blog/content/markdowns/nodejs/new-post.md'
    )
    expect(putCall[1]?.method).toBe('PUT')
    const putBody = JSON.parse(String(putCall[1]?.body)) as { sha?: string; content: string; branch: string }
    expect(putBody.sha).toBeUndefined() // 신규 파일 — sha 없음
    expect(putBody.branch).toBe('main')
    expect(Buffer.from(putBody.content, 'base64').toString('utf8')).toContain("title: '새 글'")
    expect(result.commitUrl).toBe('https://github.com/x/y/commit/commit-sha-1')
  })

  it('갱신 저장 시 기존 sha 를 선조회해 PUT body 에 포함한다 (409/422 없이 성공)', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ sha: 'existing-sha', content: '', encoding: 'base64' }))
      .mockResolvedValueOnce(
        jsonResponse({
          content: { sha: 'blob-sha-2', path: 'apps/maeng-blog/content/markdowns/nodejs/existing.md' },
          commit: { sha: 'commit-sha-2', html_url: 'https://github.com/x/y/commit/commit-sha-2' },
        })
      )

    const store = createGitHubPostStore(env)
    await store.save({
      category: 'nodejs',
      fileName: 'existing',
      frontmatter: { title: '갱신', category: 'nodejs', date: '2026-07-26 10:00:00' },
      body: '갱신 본문',
    })

    const putBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body)) as { sha?: string }
    expect(putBody.sha).toBe('existing-sha')
  })
})

describe('createGitHubPostStore.load', () => {
  it('base64 콘텐츠를 디코드해 frontmatter/body 를 반환한다', async () => {
    const markdown = serializePostMarkdown(
      { title: '로드 테스트', category: 'nodejs', date: '2026-07-01 09:00:00' },
      '본문입니다.\n'
    )
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ sha: 'x', content: Buffer.from(markdown, 'utf8').toString('base64'), encoding: 'base64' })
    )

    const store = createGitHubPostStore(env)
    const loaded = await store.load('nodejs', 'load-test')
    expect(loaded.frontmatter.title).toBe('로드 테스트')
    expect(loaded.body.trim()).toBe('본문입니다.')
  })

  it('404 응답은 PostNotFoundError 로 변환된다', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }))
    const store = createGitHubPostStore(env)
    await expect(store.load('nodejs', 'missing')).rejects.toBeInstanceOf(PostNotFoundError)
  })
})

describe('createGitHubImageStore.put (AC-M3-004/013)', () => {
  it('/content-images/{uuid}.{ext} 경로를 반환하고 커밋 경로가 content/images/ 하위다', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        jsonResponse({
          content: { sha: 'img-sha', path: 'apps/maeng-blog/content/images/x.png' },
          commit: { sha: 'commit-img', html_url: 'https://github.com/x/y/commit/commit-img' },
        })
      )

    const store = createGitHubImageStore(env)
    const result = await store.put({ fileName: 'upload.png', contentType: 'image/png', buffer: Buffer.from([1]) })
    expect(result.path).toMatch(/^\/content-images\/[0-9a-f-]{36}\.png$/)
    const putUrl = String(fetchMock.mock.calls[1][0])
    expect(putUrl).toContain('/contents/apps/maeng-blog/content/images/')
  })
})

describe('commitFiles — 순차 발행 계약 (AC-M3-007, REQ-STORE-006, CON-5)', () => {
  it('다중 파일 커밋 시 병렬(Promise.all) 이 아니라 순차로 발행된다', async () => {
    let inFlight = 0
    let maxConcurrent = 0

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (!init || init.method === undefined) {
        // getFileSha 조회 — 항상 신규 취급
        return new Response(null, { status: 404 })
      }
      inFlight += 1
      maxConcurrent = Math.max(maxConcurrent, inFlight)
      await new Promise((resolve) => setTimeout(resolve, 5))
      inFlight -= 1
      const path = String(input).split('/contents/')[1]?.split('?')[0] ?? 'unknown'
      return jsonResponse({
        content: { sha: `sha-${path}`, path },
        commit: { sha: `commit-${path}`, html_url: `https://github.com/x/y/commit/commit-${path}` },
      })
    })

    const results = await commitFiles(env, [
      { path: 'apps/maeng-blog/content/markdowns/a/one.md', content: 'one', message: 'm1' },
      { path: 'apps/maeng-blog/content/markdowns/a/two.md', content: 'two', message: 'm2' },
      { path: 'apps/maeng-blog/content/markdowns/a/three.md', content: 'three', message: 'm3' },
    ])

    expect(results).toHaveLength(3)
    expect(maxConcurrent).toBe(1) // 병렬 발행이었다면 2 이상이 관측된다
  })
})
