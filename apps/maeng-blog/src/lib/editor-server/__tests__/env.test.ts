// env 파싱 계층 — SPEC-MAENGV2-EDITOR-MERGE-006 M3 (REQ-STORE-004/009)
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getAuthEnv, getGitHubEnv, getOpenAIEnv, getStorageDriver } from '@/lib/editor-server/env'

function clearEditorEnv() {
  for (const key of [
    'EDITOR_STORAGE_DRIVER',
    'GITHUB_TOKEN',
    'GITHUB_REPO_OWNER',
    'GITHUB_REPO_NAME',
    'GITHUB_BRANCH',
    'OPENAI_API_KEY',
    'OPENAI_MODEL',
    'EDITOR_AUTH_TOKEN',
    'EDITOR_AUTH_DISABLED',
  ]) {
    delete process.env[key]
  }
}

beforeEach(clearEditorEnv)
afterEach(clearEditorEnv)

describe('getStorageDriver', () => {
  it('미지정 시 fs 를 기본값으로 반환한다', () => {
    expect(getStorageDriver()).toBe('fs')
  })

  it('fs | github 값을 그대로 반환한다', () => {
    process.env.EDITOR_STORAGE_DRIVER = 'github'
    expect(getStorageDriver()).toBe('github')
  })

  it('잘못된 값은 식별 가능한 에러를 던진다', () => {
    process.env.EDITOR_STORAGE_DRIVER = 's3'
    expect(() => getStorageDriver()).toThrow(/EDITOR_STORAGE_DRIVER/)
  })
})

describe('getGitHubEnv', () => {
  it('필수 키 누락 시 식별 가능한 에러를 던진다 (silent failure 금지)', () => {
    expect(() => getGitHubEnv()).toThrow(/GITHUB_TOKEN/)
  })

  it('GITHUB_BRANCH 미지정 시 main 을 기본값으로 사용한다 (plan.md §C C-4)', () => {
    process.env.GITHUB_TOKEN = 'tok'
    process.env.GITHUB_REPO_OWNER = 'maeng2418'
    process.env.GITHUB_REPO_NAME = 'maeng2418.github.io'
    const env = getGitHubEnv()
    expect(env).toEqual({
      token: 'tok',
      owner: 'maeng2418',
      repo: 'maeng2418.github.io',
      branch: 'main',
    })
  })

  it('GITHUB_BRANCH 지정 시 해당 값을 사용한다', () => {
    process.env.GITHUB_TOKEN = 'tok'
    process.env.GITHUB_REPO_OWNER = 'maeng2418'
    process.env.GITHUB_REPO_NAME = 'maeng2418.github.io'
    process.env.GITHUB_BRANCH = 'develop'
    expect(getGitHubEnv().branch).toBe('develop')
  })
})

describe('getOpenAIEnv', () => {
  it('OPENAI_MODEL 누락 시 식별 가능한 에러를 던진다 (하드코딩 금지, REQ-ASSIST-002)', () => {
    process.env.OPENAI_API_KEY = 'key'
    expect(() => getOpenAIEnv()).toThrow(/OPENAI_MODEL/)
  })

  it('env 값을 그대로 반환한다', () => {
    process.env.OPENAI_API_KEY = 'key'
    process.env.OPENAI_MODEL = 'gpt-test'
    expect(getOpenAIEnv()).toEqual({ apiKey: 'key', model: 'gpt-test' })
  })
})

describe('getAuthEnv (M4 소비 지점 — 파싱만 M3 담당)', () => {
  it('EDITOR_AUTH_TOKEN 누락 시 에러를 던진다', () => {
    expect(() => getAuthEnv()).toThrow(/EDITOR_AUTH_TOKEN/)
  })

  it('EDITOR_AUTH_DISABLED="1" 만 disabled=true 로 해석한다', () => {
    process.env.EDITOR_AUTH_TOKEN = 'x'.repeat(32)
    expect(getAuthEnv().disabled).toBe(false)
    process.env.EDITOR_AUTH_DISABLED = '1'
    expect(getAuthEnv().disabled).toBe(true)
    process.env.EDITOR_AUTH_DISABLED = 'true'
    expect(getAuthEnv().disabled).toBe(false)
  })
})
