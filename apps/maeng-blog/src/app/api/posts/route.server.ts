// GET /api/posts — 포스트 목록. 서버 타깃 전용 라우트(design.md §B D1 pageExtensions 분기).
// 인증 가드는 M4에서 미들웨어 + requireEditorAuth() 로 부착된다(design.md §B D6) — M3는 저장소 연동만 담당.
import { NextResponse } from 'next/server'
import { createPostStore } from '@/lib/editor-server/store'

export async function GET(): Promise<Response> {
  try {
    const posts = await createPostStore().list()
    return NextResponse.json(posts)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
