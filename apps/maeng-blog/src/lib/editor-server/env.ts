// 서버 전용 env 파싱 계층 — SPEC-MAENGV2-EDITOR-MERGE-006 M3 (design.md §B D3/D4, REQ-STORE-004/009)
// 시크릿은 서버 env 에서만 읽는다 (NEXT_PUBLIC_ 접두 금지). 호출 시점에 lazily 파싱한다(모듈 레벨 캐시 없음).
// EDITOR_AUTH_* 파싱은 M4(인증 게이트)가 소비할 지점을 M3에서 미리 마련한다 — 강제(미들웨어/가드)는 M4 범위.
import { z } from 'zod'

export type StorageDriver = 'fs' | 'github'

export interface GitHubRuntimeEnv {
  token: string
  owner: string
  repo: string
  /** 커밋 대상 브랜치 — 미지정 시 'main'(plan.md §C C-4 확정 결정) */
  branch: string
}

export interface OpenAIRuntimeEnv {
  apiKey: string
  model: string
}

export interface AuthRuntimeEnv {
  token: string
  /** 로컬 개발 전용 우회 플래그 — Workers Secret 목록에는 절대 포함하지 않는다(M4 AC-M4-015) */
  disabled: boolean
}

const nonEmpty = z.string().trim().min(1)

const StorageDriverSchema = z.enum(['fs', 'github'])

const GitHubEnvSchema = z.object({
  GITHUB_TOKEN: nonEmpty,
  GITHUB_REPO_OWNER: nonEmpty,
  GITHUB_REPO_NAME: nonEmpty,
  GITHUB_BRANCH: z.string().optional(),
})

const OpenAIEnvSchema = z.object({
  OPENAI_API_KEY: nonEmpty,
  OPENAI_MODEL: nonEmpty,
})

/** 누락/공백 키 이름을 식별 가능한 에러 메시지로 표면화한다(§C: silent failure 금지) */
function missingEnvError(keys: string[]): Error {
  return new Error(
    `missing required env: ${keys.join(', ')} (apps/maeng-blog/.env.local 또는 Cloudflare Workers Secret 을 확인하세요)`
  )
}

export function getStorageDriver(): StorageDriver {
  const raw = process.env.EDITOR_STORAGE_DRIVER?.trim()
  if (!raw) return 'fs'
  const parsed = StorageDriverSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(`invalid EDITOR_STORAGE_DRIVER: "${raw}" (expected "fs" or "github")`)
  }
  return parsed.data
}

export function getGitHubEnv(): GitHubRuntimeEnv {
  const parsed = GitHubEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    throw missingEnvError([...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))])
  }
  return {
    token: parsed.data.GITHUB_TOKEN,
    owner: parsed.data.GITHUB_REPO_OWNER,
    repo: parsed.data.GITHUB_REPO_NAME,
    branch: parsed.data.GITHUB_BRANCH?.trim() || 'main',
  }
}

export function getOpenAIEnv(): OpenAIRuntimeEnv {
  const parsed = OpenAIEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    throw missingEnvError([...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))])
  }
  return { apiKey: parsed.data.OPENAI_API_KEY, model: parsed.data.OPENAI_MODEL }
}

/** M4 인증 게이트(design.md §B D3)가 소비할 env — 파싱만 M3에서 담당, 강제는 M4 범위 */
export function getAuthEnv(): AuthRuntimeEnv {
  const token = process.env.EDITOR_AUTH_TOKEN?.trim()
  if (!token) throw missingEnvError(['EDITOR_AUTH_TOKEN'])
  return { token, disabled: process.env.EDITOR_AUTH_DISABLED === '1' }
}
