// GET /api/posts — 포스트 목록. 서버 타깃 전용 라우트(design.md §B D1 pageExtensions 분기).
// 2계층 인증 가드(design.md §B D6) — 미들웨어가 우회되어도 이 지점에서 재확인한다.
import { NextResponse } from 'next/server'
import { requireEditorAuth } from '@/lib/editor-server/auth'
import { createPostStore } from '@/lib/editor-server/store'

export async function GET(request: Request): Promise<Response> {
  const denied = await requireEditorAuth(request)
  if (denied) return denied

  try {
    const posts = await createPostStore().list()
    return NextResponse.json(posts)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
