// AC-EDITOR-004 — S3 마크다운 저장/목록/로드 (서버 계층, SDK 모킹)
// Put/List/Get 커맨드 파라미터(버킷·키 스킴) + 로드→수정→저장 frontmatter 보존 검증.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { serializePostMarkdown } from '@/lib/content-contract/frontmatter'

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

import { listPosts, loadPost, savePost } from '@/lib/server/posts'

function setEnv() {
  process.env.AWS_REGION = 'ap-northeast-2'
  process.env.AWS_BUCKET_NAME = 'test-bucket'
  process.env.AWS_CLOUDFRONT_URL = 'https://cdn.example.com'
  process.env.AWS_BUCKET_MARKDOWN_FOLDER_PREFIX = 'blog'
  process.env.AWS_BUCKET_IMAGE_FOLDER_PREFIX = 'blog/images'
}

beforeEach(() => {
  sendMock.mockReset()
  setEnv()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('savePost — PutObjectCommand 파라미터 (REQ-EDITOR-004)', () => {
  it('markdown prefix 키 레이아웃(blog/markdowns/{category}/{fileName}.md)으로 PutObject 를 발행한다', async () => {
    sendMock.mockResolvedValueOnce({})

    const result = await savePost({
      fileName: 'my-post',
      frontmatter: {
        title: '포스트 제목',
        date: '2026-07-24 10:00:00',
        category: 'development',
        draft: false,
      },
      body: '# 본문\n',
    })

    expect(sendMock).toHaveBeenCalledTimes(1)
    const command = sendMock.mock.calls[0][0] as { input: Record<string, unknown> }
    expect(command.constructor.name).toBe('PutObjectCommand')
    expect(command.input.Bucket).toBe('test-bucket')
    expect(command.input.Key).toBe('blog/markdowns/development/my-post.md')
    expect(command.input.ContentType).toContain('text/markdown')
    const bodyText = String(command.input.Body)
    expect(bodyText).toContain("title: '포스트 제목'")
    expect(bodyText).toContain("category: 'development'")
    expect(result.key).toBe('blog/markdowns/development/my-post.md')
  })
})

describe('listPosts — ListObjectsV2Command 파라미터 + 키 파싱 (REQ-EDITOR-005)', () => {
  it('markdown prefix 하위를 나열하고 계약 키 레이아웃만 요약으로 반환한다 (페이지네이션 포함)', async () => {
    sendMock
      .mockResolvedValueOnce({
        Contents: [
          { Key: 'blog/markdowns/development/a.md', LastModified: new Date('2026-01-02') },
          { Key: 'blog/markdowns/', Size: 0 },
        ],
        IsTruncated: true,
        NextContinuationToken: 'token-1',
      })
      .mockResolvedValueOnce({
        Contents: [
          { Key: 'blog/markdowns/git/b.md', LastModified: new Date('2026-01-05') },
          { Key: 'blog/other/ignored.txt' },
        ],
        IsTruncated: false,
      })

    const posts = await listPosts()

    expect(sendMock).toHaveBeenCalledTimes(2)
    const first = sendMock.mock.calls[0][0] as { input: Record<string, unknown> }
    expect(first.constructor.name).toBe('ListObjectsV2Command')
    expect(first.input.Bucket).toBe('test-bucket')
    expect(first.input.Prefix).toBe('blog/markdowns/')
    const second = sendMock.mock.calls[1][0] as { input: Record<string, unknown> }
    expect(second.input.ContinuationToken).toBe('token-1')

    // 계약 레이아웃 키만, lastModified 내림차순
    expect(posts.map((p) => p.key)).toEqual([
      'blog/markdowns/git/b.md',
      'blog/markdowns/development/a.md',
    ])
    expect(posts[0]).toMatchObject({ category: 'git', fileName: 'b' })
  })
})

describe('loadPost — GetObjectCommand + 로드→수정→저장 frontmatter 보존', () => {
  it('GetObject 로 로드한 포스트를 수정 저장해도 frontmatter 계약 필드가 보존된다', async () => {
    const original = serializePostMarkdown(
      {
        title: "원본 제목 'quoted'",
        date: '2025-03-01 09:30:00',
        category: 'react',
        thumbnail: 'blog/images/thumb.png',
        draft: true,
      },
      '원본 본문입니다.\n'
    )

    sendMock.mockResolvedValueOnce({
      Body: { transformToString: async () => original },
    })

    const loaded = await loadPost('react', 'hooks-post')

    const get = sendMock.mock.calls[0][0] as { input: Record<string, unknown> }
    expect(get.constructor.name).toBe('GetObjectCommand')
    expect(get.input.Bucket).toBe('test-bucket')
    expect(get.input.Key).toBe('blog/markdowns/react/hooks-post.md')
    expect(loaded.frontmatter).toEqual({
      title: "원본 제목 'quoted'",
      date: '2025-03-01 09:30:00',
      category: 'react',
      thumbnail: 'blog/images/thumb.png',
      draft: true,
    })

    // 본문만 수정하여 재저장 — frontmatter 무손실 왕복
    sendMock.mockResolvedValueOnce({})
    await savePost({
      fileName: 'hooks-post',
      frontmatter: loaded.frontmatter,
      body: `${loaded.body}\n추가 문단.\n`,
    })

    const put = sendMock.mock.calls[1][0] as { input: Record<string, unknown> }
    expect(put.input.Key).toBe('blog/markdowns/react/hooks-post.md')
    const saved = String(put.input.Body)
    expect(saved).toContain("title: '원본 제목 ''quoted'''")
    expect(saved).toContain("date: '2025-03-01 09:30:00'")
    expect(saved).toContain("thumbnail: 'blog/images/thumb.png'")
    expect(saved).toContain('draft: true')
    expect(saved).toContain('추가 문단.')
  })

  it('필수 env 누락 시 식별 가능한 에러를 던진다 (silent failure 금지)', async () => {
    delete process.env.AWS_BUCKET_NAME
    await expect(listPosts()).rejects.toThrow(/AWS_BUCKET_NAME/)
    expect(sendMock).not.toHaveBeenCalled()
  })
})
