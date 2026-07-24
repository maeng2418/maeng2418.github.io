'use client'

// Milkdown 7 에디터 표면 — REQ-EDITOR-002 (마크다운 네이티브 저작)
// 직렬화/플러그인 구성은 src/lib/editor/headless.ts 심을 공유한다 (테스트 가능성 설계).
// 이미지 삽입은 M4 업로드 Route Handler(/api/images → blog/images/{uuid}.{ext})와 연동 (REQ-EDITOR-006).
import { useRef, useState } from 'react'
import { Editor } from '@milkdown/kit/core'
import { insertImageCommand, toggleLinkCommand } from '@milkdown/kit/preset/commonmark'
import { callCommand } from '@milkdown/kit/utils'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import ky from 'ky'
import { configureEditor } from '@/lib/editor/headless'

interface MilkdownEditorProps {
  defaultValue: string
  onChange: (markdown: string) => void
}

function EditorCore({ defaultValue, onChange }: MilkdownEditorProps) {
  const { get } = useEditor(
    (root) =>
      configureEditor(Editor.make(), defaultValue, { root, onMarkdownUpdated: onChange }),
    // defaultValue 는 마운트 시 1회 주입 — 편집 중 재생성 방지 (문서 교체는 상위에서 key 리마운트)
    []
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // 이미지 업로드 → CloudFront URL 삽입 (클라이언트는 ky/fetch 만 사용 — SDK 미포함, REQ-EDITOR-010)
  const uploadAndInsertImage = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const response = await ky.post('/api/images', { body: form, throwHttpErrors: false })
      const json = (await response.json().catch(() => null)) as {
        imageUrl?: string
        error?: string
      } | null
      if (!response.ok || !json?.imageUrl) {
        throw new Error(json?.error ?? `업로드 실패 (HTTP ${response.status})`)
      }
      const alt = file.name.replace(/\.[^.]+$/, '')
      get()?.action(callCommand(insertImageCommand.key, { src: json.imageUrl, alt }))
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : String(error))
    } finally {
      setUploading(false)
    }
  }

  // 링크 편집 — 선택 영역에 링크 마크 토글
  const toggleLink = () => {
    const href = window.prompt('링크 URL')?.trim()
    if (!href) return
    get()?.action(callCommand(toggleLinkCommand.key, { href }))
  }

  return (
    <div className="rounded-md border border-line bg-card">
      <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
        <ToolbarButton
          label={uploading ? '업로드 중…' : '이미지'}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        />
        <ToolbarButton label="링크" onClick={toggleLink} />
        {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
        <span className="ml-auto text-xs text-ink-faint">Milkdown · GFM</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) void uploadAndInsertImage(file)
          }}
        />
      </div>
      <div className="editor-surface">
        <Milkdown />
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded px-2 py-1 text-sm text-ink-soft hover:bg-accent-soft hover:text-accent disabled:opacity-50"
    >
      {label}
    </button>
  )
}

export default function MilkdownEditor(props: MilkdownEditorProps) {
  return (
    <MilkdownProvider>
      <EditorCore {...props} />
    </MilkdownProvider>
  )
}
