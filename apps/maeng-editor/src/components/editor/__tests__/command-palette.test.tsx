// AC-ENH-011 — ⌘K 커맨드 팔레트: 포스트 검색/전환 + 액션(저장/동기화/로케일) (REQ-ENH-011)
// AC-ENH-010 보조 — EditorShell 의 상태 문자열이 sonner 토스트로 대체되었는지 소스 특성화.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NextIntlClientProvider } from 'next-intl'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import CommandPalette from '@/components/editor/CommandPalette'
import type { PostSummary } from '@/lib/server/posts'
import ko from '../../../../messages/ko.json'

const POSTS: PostSummary[] = [
  {
    key: 'markdowns/development/hello.md',
    category: 'development',
    fileName: 'hello.md',
    lastModified: null,
  },
  {
    key: 'markdowns/javascript/big-o.md',
    category: 'javascript',
    fileName: 'big-o.md',
    lastModified: null,
  },
]

function render(ui: React.ReactElement) {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale="ko" messages={ko} timeZone="Asia/Seoul">
      {ui}
    </NextIntlClientProvider>
  )
}

const NOOP = () => {}

describe('CommandPalette (cmdk)', () => {
  it('닫힘 상태에서는 아무것도 렌더하지 않는다', () => {
    const html = render(
      <CommandPalette
        open={false}
        onClose={NOOP}
        posts={POSTS}
        onSelectPost={NOOP}
        onSave={NOOP}
        onToggleLocale={NOOP}
      />
    )
    expect(html).toBe('')
  })

  it('열림 상태에서 포스트 목록 + 액션(저장/로케일)이 카탈로그 문자열로 렌더된다', () => {
    const html = render(
      <CommandPalette
        open
        onClose={NOOP}
        posts={POSTS}
        onSelectPost={NOOP}
        onSave={NOOP}
        onToggleLocale={NOOP}
      />
    )
    expect(html).toContain('hello.md')
    expect(html).toContain('big-o.md')
    expect(html).toContain(ko.editor.palette.placeholder)
    expect(html).toContain(ko.editor.palette.save)
    expect(html).toContain(ko.editor.palette.toggleLocale)
    // capability gate — onSync 미공급 시 동기화 항목 미노출
    expect(html).not.toContain(ko.editor.palette.sync)
  })

  it('onSync 공급 시(blogSyncEnabled) 동기화 액션이 노출된다', () => {
    const html = render(
      <CommandPalette
        open
        onClose={NOOP}
        posts={[]}
        onSelectPost={NOOP}
        onSave={NOOP}
        onSync={NOOP}
        onToggleLocale={NOOP}
      />
    )
    expect(html).toContain(ko.editor.palette.sync)
  })
})

describe('EditorShell 상태 표면 (REQ-ENH-010 특성화)', () => {
  const source = readFileSync(
    join(__dirname, '..', 'EditorShell.tsx'),
    'utf8'
  )

  it('setStatus 문자열 상태가 제거되고 sonner 토스트가 담당한다', () => {
    expect(source).not.toContain('setStatus(')
    expect(source).toContain("from 'sonner'")
    expect(source).toContain('toast.success')
    expect(source).toContain('toast.error')
  })

  it('⌘K/Ctrl+K 리스너가 capture 단계로 등록된다 (R7 — Milkdown 키바인딩 충돌 회피)', () => {
    expect(source).toContain('{ capture: true }')
    expect(source).toContain('CommandPalette')
  })
})
