'use server'

// 로컬 블로그 미리보기 동기화 Server Action — REQ-EDITOR-008 (capability gate)
import { actionError, type ActionResult } from '@/lib/action-result'
import { isBlogSyncEnabled, syncToBlogContentDir, type BlogSyncResult } from '@/lib/server/blog-sync'

export async function syncBlogPreviewAction(): Promise<ActionResult<BlogSyncResult>> {
  if (!isBlogSyncEnabled()) {
    return { ok: false, error: 'BLOG_CONTENT_DIR 미설정 — 미리보기 동기화가 비활성입니다' }
  }
  try {
    return { ok: true, data: await syncToBlogContentDir() }
  } catch (error) {
    return actionError(error)
  }
}
