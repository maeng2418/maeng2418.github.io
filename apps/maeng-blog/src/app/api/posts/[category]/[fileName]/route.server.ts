// GET/PUT /api/posts/[category]/[fileName] — 단일 포스트 로드/저장. 서버 타깃 전용 라우트.
// 딥링크(GET, design.md §B D9)와 신규/수정 저장(PUT, REQ-EDIT-004)이 동일 경로 계약을 공유한다.
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { formatFrontmatterDate } from '@/lib/content-contract/date'
import type { PostFrontmatter } from '@/lib/content-contract/types'
import { requireEditorAuth } from '@/lib/editor-server/auth'
import { parseDeepLinkPath } from '@/lib/editor-server/deep-link'
import { createPostStore, PostNotFoundError } from '@/lib/editor-server/store'

interface RouteParams {
  params: Promise<{ category: string; fileName: string }>
}

function invalidSegmentResponse(error: unknown): Response {
  const message = error instanceof Error ? error.message : String(error)
  return NextResponse.json({ error: message }, { status: 400 })
}

// 라우트 파라미터를 딥링크 검증의 단일 지점(parseDeepLinkPath → assertSafeSegment)에 통과시킨다.
// 별도 검증 경로를 두지 않는다(design.md §B D9, REQ-EDIT-006).
function validateSegments(category: string, fileName: string): { category: string; fileName: string } {
  return parseDeepLinkPath(`${category}/${fileName}`)
}

export async function GET(request: Request, { params }: RouteParams): Promise<Response> {
  const denied = await requireEditorAuth(request)
  if (denied) return denied

  const { category, fileName } = await params
  let target: { category: string; fileName: string }
  try {
    target = validateSegments(category, fileName)
  } catch (error) {
    return invalidSegmentResponse(error)
  }

  try {
    const post = await createPostStore().load(target.category, target.fileName)
    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

const SavePostBodySchema = z.object({
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  thumbnail: z.string().trim().optional(),
  draft: z.boolean().optional(),
  date: z.string().trim().nullable().optional(),
  body: z.string(),
})

export async function PUT(request: Request, { params }: RouteParams): Promise<Response> {
  const denied = await requireEditorAuth(request)
  if (denied) return denied

  const { category, fileName } = await params
  let target: { category: string; fileName: string }
  try {
    target = validateSegments(category, fileName)
  } catch (error) {
    return invalidSegmentResponse(error)
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON 본문이 필요합니다' }, { status: 400 })
  }
  const parsed = SavePostBodySchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 })
  }

  // 저장 경로는 URL 세그먼트가 결정한다(동일 경로 저장 계약, REQ-EDIT-004) — body.category 는 frontmatter 값일 뿐이다.
  const frontmatter: PostFrontmatter = {
    title: parsed.data.title,
    category: parsed.data.category,
    date: parsed.data.date ?? formatFrontmatterDate(new Date()),
  }
  if (parsed.data.thumbnail) frontmatter.thumbnail = parsed.data.thumbnail
  if (parsed.data.draft !== undefined) frontmatter.draft = parsed.data.draft

  try {
    const result = await createPostStore().save({
      category: target.category,
      fileName: target.fileName,
      frontmatter,
      body: parsed.data.body,
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
