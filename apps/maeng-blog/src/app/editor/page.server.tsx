import type { Metadata } from 'next'
import EditorShell from '@/components/editor/EditorShell'
import { requireEditorAuthPage } from '@/lib/editor-server/auth'

// SPEC-MAENGV2-EDITOR-MERGE-006 — 서버 타깃 전용 라우트(design.md §B D1 pageExtensions 분기).
// 정적 export 산출물에는 이 파일 자체가 라우트 트리에 존재하지 않는다(REQ-DEPLOY-002/005).
// `?path=` 질의 파라미터는 M2에서 수용만 하고, 실제 로드 연동(GET /api/posts/{category}/{fileName})
// 은 M3에서 구현했다(design.md §B D9 딥링크 계약).
// 2계층 인증 가드(M4, design.md §B D6) — 미인증 딥링크 접근을 차단한다(REQ-EDIT-005).
export const metadata: Metadata = {
  title: 'maeng-blog editor',
}

interface EditorPageProps {
  searchParams: Promise<{ path?: string }>
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const { path } = await searchParams
  const nextPath = path ? `/editor?path=${encodeURIComponent(path)}` : '/editor'
  await requireEditorAuthPage(nextPath)
  return <EditorShell initialPath={path} />
}
