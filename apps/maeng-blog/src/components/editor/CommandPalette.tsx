'use client'

// 커맨드 팔레트 — ⌘K/Ctrl+K (REQ-ENH-011 계승, 구 저작 도구 앱에서 이관)
// cmdk 의 Command 를 자체 오버레이에 인라인 배치한다 (Command.Dialog/portal 미사용 —
// quiet utilitarian 스타일 일관 + 테스트 용이). 포스트 목록은 react-query postsQuery
// 캐시를 소비하고(부모가 props 로 공급), 저장/로케일 전환 액션을 함께 노출한다.
// 문자열은 전부 next-intl ko/en 카탈로그 경유.
import { useEffect, useRef } from 'react'
import { Command } from 'cmdk'
import { useTranslations } from 'next-intl'
import type { PostSummary } from '@/lib/editor/types'

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  posts: readonly PostSummary[]
  onSelectPost: (post: PostSummary) => void
  onSave: () => void
  onToggleLocale: () => void
}

export default function CommandPalette({
  open,
  onClose,
  posts,
  onSelectPost,
  onSave,
  onToggleLocale,
}: CommandPaletteProps) {
  const t = useTranslations('editor.palette')
  const inputRef = useRef<HTMLInputElement>(null)

  // 열릴 때 입력에 포커스 — Esc 닫힘 시 에디터 포커스는 브라우저 기본 복원에 맡긴다
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!open) return null

  const runAndClose = (action: () => void) => {
    onClose()
    action()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[15vh]"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          onClose()
        }
      }}
    >
      {/* 내부 클릭이 백드롭 닫힘으로 전파되는 것만 차단 */}
      <div className="w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
        <Command
          label={t('placeholder')}
          className="overflow-hidden rounded-md border border-line bg-card shadow-lg"
        >
          <Command.Input
            ref={inputRef}
            placeholder={t('placeholder')}
            className="w-full border-b border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <Command.List className="max-h-72 overflow-y-auto p-1.5">
            <Command.Empty className="px-3 py-6 text-center text-xs text-ink-faint">
              {t('empty')}
            </Command.Empty>

            <Command.Group
              heading={t('actions')}
              className="text-[11px] font-semibold text-ink-faint [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
            >
              <Command.Item
                onSelect={() => runAndClose(onSave)}
                className="cursor-pointer rounded px-2 py-1.5 text-sm font-normal text-ink data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent"
              >
                {t('save')}
              </Command.Item>
              <Command.Item
                onSelect={() => runAndClose(onToggleLocale)}
                className="cursor-pointer rounded px-2 py-1.5 text-sm font-normal text-ink data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent"
              >
                {t('toggleLocale')}
              </Command.Item>
            </Command.Group>

            <Command.Group
              heading={t('posts')}
              className="text-[11px] font-semibold text-ink-faint [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
            >
              {posts.map((post) => (
                <Command.Item
                  key={post.key}
                  value={`${post.category}/${post.fileName}`}
                  onSelect={() => runAndClose(() => onSelectPost(post))}
                  className="cursor-pointer rounded px-2 py-1.5 text-sm font-normal text-ink data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent"
                >
                  <span className="truncate">{post.fileName}</span>
                  <span className="ml-2 text-xs text-ink-faint">{post.category}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
