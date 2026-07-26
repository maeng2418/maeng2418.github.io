// PostStore/ImageStore 팩토리 — EDITOR_STORAGE_DRIVER 에 따라 fs | github 구현을 선택한다(design.md §B D4)
import { getGitHubEnv, getStorageDriver } from '../env'
import { createFsImageStore, createFsPostStore } from './fs-store'
import { createGitHubImageStore, createGitHubPostStore } from './github-store'
import type { ImageStore, PostStore } from './types'

export function createPostStore(): PostStore {
  const driver = getStorageDriver()
  return driver === 'github' ? createGitHubPostStore(getGitHubEnv()) : createFsPostStore()
}

export function createImageStore(): ImageStore {
  const driver = getStorageDriver()
  return driver === 'github' ? createGitHubImageStore(getGitHubEnv()) : createFsImageStore()
}

export * from './types'
