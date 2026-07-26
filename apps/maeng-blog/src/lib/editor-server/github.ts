// GitHub Contents API 클라이언트 — SPEC-MAENGV2-EDITOR-MERGE-006 M3 (design.md §B D4)
// GET sha 선조회 → PUT commit, base64 페이로드. 다중 파일 커밋은 순차 발행을 코드로 강제한다
// (REQ-STORE-006, CON-5) — commitFiles 가 유일한 다중 파일 발행 지점이다.
import type { GitHubRuntimeEnv } from './env'

const GITHUB_API_BASE = 'https://api.github.com'
const API_VERSION = '2022-11-28'
const USER_AGENT = 'maeng-blog-editor (SPEC-MAENGV2-EDITOR-MERGE-006)'

export class GitHubApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'GitHubApiError'
  }
}

interface ContentsGetResponse {
  sha: string
  content: string
  encoding: string
}

interface ContentsPutResponse {
  content: { sha: string; path: string }
  commit: { sha: string; html_url: string }
}

export interface GitHubTreeEntry {
  path: string
  type: 'blob' | 'tree' | 'commit'
  sha: string
}

interface TreeResponse {
  tree: GitHubTreeEntry[]
  truncated: boolean
}

function authHeaders(env: GitHubRuntimeEnv): HeadersInit {
  return {
    Authorization: `Bearer ${env.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': API_VERSION,
    'User-Agent': USER_AGENT,
  }
}

function contentsUrl(env: GitHubRuntimeEnv, path: string): string {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  return `${GITHUB_API_BASE}/repos/${env.owner}/${env.repo}/contents/${encodedPath}`
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text()
  } catch {
    return ''
  }
}

function encodeContentBase64(content: string | Buffer): string {
  return Buffer.isBuffer(content) ? content.toString('base64') : Buffer.from(content, 'utf8').toString('base64')
}

function decodeContentBase64(content: string): string {
  return Buffer.from(content, 'base64').toString('utf8')
}

/** 파일의 현재 blob sha 를 조회한다. 존재하지 않으면 null(신규 저장 경로). */
export async function getFileSha(env: GitHubRuntimeEnv, path: string): Promise<string | null> {
  const res = await fetch(`${contentsUrl(env, path)}?ref=${encodeURIComponent(env.branch)}`, {
    headers: authHeaders(env),
  })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new GitHubApiError(`GitHub GET ${path} failed: ${res.status} ${await safeText(res)}`, res.status)
  }
  const data = (await res.json()) as ContentsGetResponse
  return data.sha
}

/** 파일 내용을 UTF-8 문자열로 조회한다. 존재하지 않으면 null. */
export async function getFileContent(
  env: GitHubRuntimeEnv,
  path: string
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(`${contentsUrl(env, path)}?ref=${encodeURIComponent(env.branch)}`, {
    headers: authHeaders(env),
  })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new GitHubApiError(`GitHub GET ${path} failed: ${res.status} ${await safeText(res)}`, res.status)
  }
  const data = (await res.json()) as ContentsGetResponse
  if (data.encoding !== 'base64') {
    throw new GitHubApiError(`unexpected encoding "${data.encoding}" for ${path}`, 500)
  }
  return { content: decodeContentBase64(data.content), sha: data.sha }
}

export interface GitHubFileWrite {
  path: string
  /** UTF-8 문자열 또는 바이너리 Buffer — base64 인코딩은 내부에서 처리한다 */
  content: string | Buffer
  message: string
}

export interface GitHubCommitResult {
  path: string
  contentSha: string
  commitSha: string
  commitUrl: string
}

/** 단일 파일을 커밋한다. sha 선조회 후 존재 시 갱신, 부재 시 신규 생성한다(REQ-STORE-005). */
async function putFile(env: GitHubRuntimeEnv, file: GitHubFileWrite): Promise<GitHubCommitResult> {
  const existingSha = await getFileSha(env, file.path)
  const res = await fetch(contentsUrl(env, file.path), {
    method: 'PUT',
    headers: { ...authHeaders(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: file.message,
      content: encodeContentBase64(file.content),
      branch: env.branch,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  })
  if (!res.ok) {
    throw new GitHubApiError(`GitHub PUT ${file.path} failed: ${res.status} ${await safeText(res)}`, res.status)
  }
  const data = (await res.json()) as ContentsPutResponse
  return {
    path: file.path,
    contentSha: data.content.sha,
    commitSha: data.commit.sha,
    commitUrl: data.commit.html_url,
  }
}

// @MX:ANCHOR: [AUTO] GitHub 커밋 순차 발행의 단일 지점 — PostStore/ImageStore 저장 경로가 모두 이 함수를 경유한다
// @MX:REASON: 병렬(Promise.all) 발행 시 Contents API 의 sha 선조회→커밋 사이 경쟁 상태로 커밋 유실 위험이 있다(design.md §B D4, REQ-STORE-006, CON-5)
export async function commitFiles(env: GitHubRuntimeEnv, files: GitHubFileWrite[]): Promise<GitHubCommitResult[]> {
  const results: GitHubCommitResult[] = []
  for (const file of files) {
    // 순차 발행이 계약 요구사항이다 — Promise.all 로 병렬화 금지(CON-5)
    results.push(await putFile(env, file))
  }
  return results
}

/** prefix 하위 blob 전체를 나열한다(재귀 — Git Trees API). Contents API 는 1단계만 나열하므로 사용하지 않는다. */
export async function listTree(env: GitHubRuntimeEnv, prefix: string): Promise<GitHubTreeEntry[]> {
  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${env.owner}/${env.repo}/git/trees/${encodeURIComponent(env.branch)}?recursive=1`,
    { headers: authHeaders(env) }
  )
  if (!res.ok) {
    throw new GitHubApiError(`GitHub tree list failed: ${res.status} ${await safeText(res)}`, res.status)
  }
  const data = (await res.json()) as TreeResponse
  return data.tree.filter((entry) => entry.type === 'blob' && entry.path.startsWith(prefix))
}
