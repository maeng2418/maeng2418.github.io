'use server'

// 포스트 저장/목록/로드 Server Action — REQ-EDITOR-004/005 (plan §B.3: 단순 뮤테이션·조회는 Server Action)
import { z } from 'zod'
import { actionError, type ActionResult } from '@/lib/action-result'
import { formatFrontmatterDate } from '@/lib/content-contract/date'
import type { PostFrontmatter } from '@/lib/content-contract/types'
import { listPosts, loadPost, savePost, type LoadedPost, type PostSummary } from '@/lib/server/posts'

const SavePostSchema = z.object({
  fileName: z.string().min(1, '파일명이 필요합니다'),
  title: z.string().min(1, '제목이 필요합니다'),
  category: z.string().min(1, '카테고리가 필요합니다'),
  thumbnail: z.string().optional(),
  draft: z.boolean().optional(),
  /** 기존 포스트 재저장 시 원본 date 보존 — 신규 저장은 null (서버가 현재 시각 부여) */
  date: z.string().nullable().optional(),
  body: z.string(),
})

export type SavePostActionInput = z.infer<typeof SavePostSchema>

export async function savePostAction(
  input: SavePostActionInput
): Promise<ActionResult<{ key: string; date: string }>> {
  const parsed = SavePostSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(', ') }
  }

  const { fileName, title, category, thumbnail, draft, date, body } = parsed.data
  const frontmatter: PostFrontmatter = {
    title,
    date: date ?? formatFrontmatterDate(new Date()),
    category,
    draft: draft ?? false,
  }
  if (thumbnail && thumbnail.trim()) frontmatter.thumbnail = thumbnail.trim()

  try {
    const { key } = await savePost({ fileName, frontmatter, body })
    return { ok: true, data: { key, date: frontmatter.date } }
  } catch (error) {
    return actionError(error)
  }
}

export async function listPostsAction(): Promise<ActionResult<PostSummary[]>> {
  try {
    return { ok: true, data: await listPosts() }
  } catch (error) {
    return actionError(error)
  }
}

const LoadPostSchema = z.object({
  category: z.string().min(1),
  fileName: z.string().min(1),
})

export async function loadPostAction(input: {
  category: string
  fileName: string
}): Promise<ActionResult<LoadedPost>> {
  const parsed = LoadPostSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'category/fileName 이 필요합니다' }
  }
  try {
    return { ok: true, data: await loadPost(parsed.data.category, parsed.data.fileName) }
  } catch (error) {
    return actionError(error)
  }
}
