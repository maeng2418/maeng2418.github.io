// AC-EDITOR-007 — 로컬 블로그 미리보기 동기화 (capability gate)
// BLOG_CONTENT_DIR 설정 시 markdowns/{category}/ + images/ 레이아웃 미러, 미설정 시 비활성.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendMock = vi.hoisted(() => vi.fn())

vi.mock('@aws-sdk/client-s3', () => {
  class S3Client {
    send = sendMock
  }
  class PutObjectCommand {
    readonly input: Record<string, unknown>
    constructor(input: Record<string, unknown>) {
      this.input = input
    }
  }
  class ListObjectsV2Command {
    readonly input: Record<string, unknown>
    constructor(input: Record<string, unknown>) {
      this.input = input
    }
  }
  class GetObjectCommand {
    readonly input: Record<string, unknown>
    constructor(input: Record<string, unknown>) {
      this.input = input
    }
  }
  return { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand }
})

import { isBlogSyncEnabled, syncToBlogContentDir } from '@/lib/server/blog-sync'

let tempDir: string

beforeEach(() => {
  sendMock.mockReset()
  process.env.AWS_REGION = 'ap-northeast-2'
  process.env.AWS_BUCKET_NAME = 'test-bucket'
  process.env.AWS_CLOUDFRONT_URL = 'https://cdn.example.com'
  process.env.AWS_BUCKET_MARKDOWN_FOLDER_PREFIX = 'blog'
  process.env.AWS_BUCKET_IMAGE_FOLDER_PREFIX = 'blog/images'
  tempDir = mkdtempSync(path.join(tmpdir(), 'blog-sync-'))
  process.env.BLOG_CONTENT_DIR = tempDir
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
  delete process.env.BLOG_CONTENT_DIR
})

describe('capability gate (REQ-EDITOR-008)', () => {
  it('BLOG_CONTENT_DIR 미설정 시 비활성 — S3 호출 없이 즉시 실패한다', async () => {
    delete process.env.BLOG_CONTENT_DIR
    expect(isBlogSyncEnabled()).toBe(false)
    await expect(syncToBlogContentDir()).rejects.toThrow(/BLOG_CONTENT_DIR/)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('설정 시 활성으로 보고한다', () => {
    expect(isBlogSyncEnabled()).toBe(true)
  })
})

describe('syncToBlogContentDir — 블로그 loader 디렉터리 레이아웃 미러', () => {
  it('S3 오브젝트를 markdowns/{category}/ 와 images/ 하위에 기록한다', async () => {
    const markdownRaw = "---\ntitle: 'a'\ndate: '2026-01-01 00:00:00'\ncategory: 'git'\n---\n\n본문\n"
    const imageBytes = new Uint8Array([137, 80, 78, 71])

    sendMock.mockImplementation(async (command: { constructor: { name: string }; input: Record<string, unknown> }) => {
      if (command.constructor.name === 'ListObjectsV2Command') {
        if (String(command.input.Prefix) === 'blog/markdowns/') {
          return {
            Contents: [
              { Key: 'blog/markdowns/git/issue_wiki.md' },
              { Key: 'blog/markdowns/' }, // 폴더 마커 — 무시
            ],
            IsTruncated: false,
          }
        }
        return {
          Contents: [{ Key: 'blog/images/pic.png' }, { Key: 'blog/images/' }],
          IsTruncated: false,
        }
      }
      // GetObjectCommand
      if (String(command.input.Key).endsWith('.md')) {
        return { Body: { transformToString: async () => markdownRaw } }
      }
      return { Body: { transformToByteArray: async () => imageBytes } }
    })

    const result = await syncToBlogContentDir()

    expect(result.markdowns).toBe(1)
    expect(result.images).toBe(1)
    expect(result.targetDir).toBe(tempDir)

    const markdownPath = path.join(tempDir, 'markdowns', 'git', 'issue_wiki.md')
    expect(readFileSync(markdownPath, 'utf-8')).toBe(markdownRaw)

    const imagePath = path.join(tempDir, 'images', 'pic.png')
    expect(new Uint8Array(readFileSync(imagePath))).toEqual(imageBytes)
  })
})
