import EditorShell from '@/components/editor/EditorShell'
import { isBlogSyncEnabled } from '@/lib/server/blog-sync'

// env capability gate 는 요청 시점에 평가한다 (REQ-EDITOR-008 — 빌드타임 고정 방지)
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return <EditorShell blogSyncEnabled={isBlogSyncEnabled()} />
}
