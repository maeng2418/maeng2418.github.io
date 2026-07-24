'use client'

// 에디터 셸 — quiet utilitarian 도구 UI (REQ-EDITOR-012: 장식/모션 없음, 밀도 우선)
// M4: 저장/목록/로드(Server Action) + 이미지 업로드 연동. M5: OpenAI 보조 패널.
// M6: 로컬 블로그 미리보기 동기화 (capability gate — blogSyncEnabled prop).
// 폼은 react-hook-form + zod resolver (Formik+Yup 대체 — plan §B.3), 클라이언트 HTTP 는 ky.
// UI 크롬 문자열은 next-intl ko/en 카탈로그에서 공급한다 (REQ-ENH-004 — ENHANCE-005 M2).
// ENHANCE-005 M4: setStatus 문자열 → sonner 토스트 (REQ-ENH-010), ⌘K cmdk 팔레트 (REQ-ENH-011).
import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import ky from 'ky'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { Toaster, toast } from 'sonner'
import { z } from 'zod'
import { listPostsAction, loadPostAction, savePostAction } from '@/app/actions/posts'
import { syncBlogPreviewAction } from '@/app/actions/sync'
import CommandPalette from '@/components/editor/CommandPalette'
import LocaleProvider, { useLocaleToggle } from '@/components/i18n/LocaleProvider'
import type { PostSummary } from '@/lib/server/posts'

// Milkdown 은 클라이언트 전용(ProseMirror DOM) — SSR 제외
const MilkdownEditor = dynamic(() => import('./MilkdownEditor'), { ssr: false })

const INITIAL_DOC = `# 새 포스트

본문을 입력하세요.
`

/** 검증 메시지를 현재 로케일 카탈로그에서 공급하는 스키마 팩토리 (REQ-ENH-004) */
function makePostMetaSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().trim().min(1, t('validation.titleRequired')),
    category: z.string().trim().min(1, t('validation.categoryRequired')),
    fileName: z
      .string()
      .trim()
      .min(1, t('validation.fileNameRequired'))
      .regex(/^[^/\\]+$/, t('validation.fileNameNoSeparator')),
    thumbnail: z.string().trim(),
    draft: z.boolean(),
  })
}

type PostMetaForm = z.infer<ReturnType<typeof makePostMetaSchema>>

const EMPTY_META: PostMetaForm = {
  title: '',
  category: '',
  fileName: '',
  thumbnail: '',
  draft: false,
}

interface EditorShellProps {
  blogSyncEnabled: boolean
}

function EditorWorkspace({ blogSyncEnabled }: EditorShellProps) {
  const queryClient = useQueryClient()
  const t = useTranslations('editor')
  const { locale, toggle: onToggleLocale } = useLocaleToggle()

  /** 목록 표기용 날짜 — 네이티브 Intl, 현재 로케일 연동 */
  const listDateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [locale]
  )

  const schema = useMemo(() => makePostMetaSchema((key) => t(key)), [t])
  const form = useForm<PostMetaForm>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_META,
  })
  const fieldErrors = form.formState.errors

  /** 로드된 포스트의 원본 date (라운드트립 보존) — 신규는 null */
  const [postDate, setPostDate] = useState<string | null>(null)
  const [markdown, setMarkdown] = useState(INITIAL_DOC)
  const [initialDoc, setInitialDoc] = useState(INITIAL_DOC)
  const [docKey, setDocKey] = useState(0)
  const [showSource, setShowSource] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  // ⌘K/Ctrl+K 전역 리스너 — capture 단계 등록으로 Milkdown(ProseMirror) 키바인딩보다
  // 먼저 가로챈다 (plan §B R7: 에디터 포커스 중에도 팔레트 우선)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        event.stopPropagation()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [])

  /** 에디터 문서를 통째로 교체한다 (Milkdown 은 defaultValue 1회 주입 → key 리마운트) */
  const replaceDocument = (nextDoc: string) => {
    setInitialDoc(nextDoc)
    setMarkdown(nextDoc)
    setDocKey((k) => k + 1)
  }

  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const result = await listPostsAction()
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (values: PostMetaForm) => {
      const result = await savePostAction({
        fileName: values.fileName,
        title: values.title,
        category: values.category,
        thumbnail: values.thumbnail || undefined,
        draft: values.draft,
        date: postDate,
        body: markdown,
      })
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) => {
      setPostDate(data.date)
      toast.success(t('status.saved', { key: data.key }))
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (error: Error) => toast.error(t('status.saveFailed', { message: error.message })),
  })

  const loadMutation = useMutation({
    mutationFn: async (summary: PostSummary) => {
      const result = await loadPostAction({
        category: summary.category,
        fileName: summary.fileName,
      })
      if (!result.ok) throw new Error(result.error)
      return { summary, post: result.data }
    },
    onSuccess: ({ summary, post }) => {
      form.reset({
        title: post.frontmatter.title,
        category: post.frontmatter.category,
        fileName: summary.fileName,
        thumbnail: post.frontmatter.thumbnail ?? '',
        draft: post.frontmatter.draft ?? false,
      })
      setPostDate(post.frontmatter.date)
      replaceDocument(post.body)
      toast.success(t('status.loaded', { key: post.key }))
    },
    onError: (error: Error) => toast.error(t('status.loadFailed', { message: error.message })),
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      const result = await syncBlogPreviewAction()
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) =>
      toast.success(t('status.syncDone', { markdowns: data.markdowns, images: data.images })),
    onError: (error: Error) => toast.error(t('status.syncFailed', { message: error.message })),
  })

  const newPost = () => {
    form.reset(EMPTY_META)
    setPostDate(null)
    replaceDocument(INITIAL_DOC)
  }

  const submitSave = form.handleSubmit((values) => saveMutation.mutate(values))

  return (
    <div className="mx-auto flex max-w-6xl gap-4 px-4 py-6">
      {/* 토스트 서피스 — 저장/로드/동기화 성공·실패 알림 (REQ-ENH-010, GWT-4) */}
      <Toaster position="bottom-right" />

      {/* ⌘K 커맨드 팔레트 — 포스트 검색/전환 + 액션 (REQ-ENH-011, GWT-3) */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        posts={postsQuery.data ?? []}
        onSelectPost={(post) => loadMutation.mutate(post)}
        onSave={() => void submitSave()}
        onSync={blogSyncEnabled ? () => syncMutation.mutate() : undefined}
        onToggleLocale={onToggleLocale}
      />

      {/* 사이드바 — 포스트 목록 + 미리보기 동기화 */}
      <aside className="flex w-64 shrink-0 flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-soft">{t('sidebar.posts')}</h2>
          <button
            type="button"
            onClick={newPost}
            className="rounded border border-line px-2 py-0.5 text-xs text-ink-soft hover:bg-accent-soft hover:text-accent"
          >
            {t('sidebar.newPost')}
          </button>
        </div>
        <div className="max-h-[28rem] overflow-y-auto rounded-md border border-line bg-card">
          {postsQuery.isLoading && (
            <p className="p-3 text-xs text-ink-faint">{t('sidebar.loading')}</p>
          )}
          {postsQuery.isError && (
            <p className="p-3 text-xs text-red-500">
              {t('sidebar.listError', { message: (postsQuery.error as Error).message })}
            </p>
          )}
          {postsQuery.data?.length === 0 && (
            <p className="p-3 text-xs text-ink-faint">{t('sidebar.empty')}</p>
          )}
          <ul>
            {postsQuery.data?.map((post) => (
              <li key={post.key}>
                <button
                  type="button"
                  onClick={() => loadMutation.mutate(post)}
                  disabled={loadMutation.isPending}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent-soft disabled:opacity-50"
                >
                  <span className="block truncate font-medium">{post.fileName}</span>
                  <span className="text-ink-faint">
                    {post.category}
                    {post.lastModified &&
                      ` · ${listDateFormat.format(new Date(post.lastModified))}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {blogSyncEnabled && (
          <button
            type="button"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="rounded border border-line px-2 py-1.5 text-xs text-ink-soft hover:bg-accent-soft hover:text-accent disabled:opacity-50"
          >
            {syncMutation.isPending ? t('sidebar.syncing') : t('sidebar.sync')}
          </button>
        )}
      </aside>

      {/* 메인 — 메타데이터 폼 + 에디터 + 보조 패널 */}
      <main className="flex min-w-0 flex-1 flex-col gap-3">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{t('appTitle')}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSource((v) => !v)}
              className="rounded border border-line px-2 py-1 text-xs text-ink-soft hover:bg-accent-soft hover:text-accent"
            >
              {showSource ? t('source.hide') : t('source.show')}
            </button>
            <button
              type="button"
              onClick={onToggleLocale}
              aria-label={t('localeSwitch.aria')}
              className="rounded border border-line px-2 py-1 text-xs font-semibold text-ink-soft hover:bg-accent-soft hover:text-accent"
            >
              {t('localeSwitch.label')}
            </button>
          </div>
        </header>

        <form
          onSubmit={submitSave}
          className="grid grid-cols-2 gap-2 rounded-md border border-line bg-card p-3"
        >
          <MetaField label={t('form.title')} error={fieldErrors.title?.message}>
            <input type="text" {...form.register('title')} className={inputClass} />
          </MetaField>
          <MetaField label={t('form.category')} error={fieldErrors.category?.message}>
            <input
              type="text"
              placeholder={t('form.categoryPlaceholder')}
              {...form.register('category')}
              className={inputClass}
            />
          </MetaField>
          <MetaField label={t('form.fileName')} error={fieldErrors.fileName?.message}>
            <input
              type="text"
              placeholder={t('form.fileNamePlaceholder')}
              {...form.register('fileName')}
              className={inputClass}
            />
          </MetaField>
          <MetaField label={t('form.thumbnail')} error={fieldErrors.thumbnail?.message}>
            <input type="text" {...form.register('thumbnail')} className={inputClass} />
          </MetaField>
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            <input type="checkbox" {...form.register('draft')} />
            {t('form.draft')}
          </label>
          <div className="flex items-center justify-end gap-2">
            {postDate && (
              <span className="text-xs text-ink-faint">{t('form.date', { date: postDate })}</span>
            )}
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {saveMutation.isPending ? t('form.saving') : t('form.save')}
            </button>
          </div>
        </form>

        <MilkdownEditor key={docKey} defaultValue={initialDoc} onChange={setMarkdown} />

        {showSource && (
          <pre className="overflow-x-auto rounded-md border border-line bg-code-bg p-4 font-mono text-xs leading-relaxed text-ink-soft">
            {markdown}
          </pre>
        )}

        <AssistPanel
          documentMarkdown={markdown}
          onInsert={(suggestion) =>
            replaceDocument(`${markdown.replace(/\s+$/, '')}\n\n${suggestion}\n`)
          }
        />
      </main>
    </div>
  )
}

const inputClass =
  'rounded border border-line bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent'

function MetaField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-ink-soft">
      <span>
        {label}
        {error && <span className="ml-2 text-red-500">{error}</span>}
      </span>
      {children}
    </label>
  )
}

// OpenAI 보조 글쓰기 패널 — REQ-EDITOR-007 (스트리밍 수신, 클라이언트는 ky/fetch 만 사용)
function AssistPanel({
  documentMarkdown,
  onInsert,
}: {
  documentMarkdown: string
  onInsert: (suggestion: string) => void
}) {
  const t = useTranslations('editor')
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!prompt.trim() || busy) return
    setBusy(true)
    setError(null)
    setOutput('')
    try {
      const response = await ky.post('/api/assist', {
        json: { prompt: prompt.trim(), context: documentMarkdown },
        timeout: false, // 스트리밍 — ky 기본 10s 타임아웃 해제
        throwHttpErrors: false,
      })
      if (!response.ok || !response.body) {
        const json = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(json?.error ?? t('assist.requestFailed', { status: response.status }))
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        setOutput((prev) => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-2 rounded-md border border-line bg-card p-3">
      <h2 className="text-sm font-semibold text-ink-soft">{t('assist.title')}</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void run()
          }}
          placeholder={t('assist.placeholder')}
          className={`flex-1 ${inputClass}`}
        />
        <button
          type="button"
          onClick={() => void run()}
          disabled={busy || !prompt.trim()}
          className="rounded border border-line px-3 py-1.5 text-sm text-ink-soft hover:bg-accent-soft hover:text-accent disabled:opacity-50"
        >
          {busy ? t('assist.running') : t('assist.run')}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {output && (
        <>
          <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded border border-line bg-code-bg p-3 font-mono text-xs leading-relaxed text-ink-soft">
            {output}
          </pre>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onInsert(output.trim())
                setOutput('')
              }}
              disabled={busy}
              className="rounded border border-line px-2 py-1 text-xs text-ink-soft hover:bg-accent-soft hover:text-accent disabled:opacity-50"
            >
              {t('assist.insert')}
            </button>
            <button
              type="button"
              onClick={() => setOutput('')}
              className="rounded border border-line px-2 py-1 text-xs text-ink-faint hover:text-ink-soft"
            >
              {t('assist.discard')}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export default function EditorShell(props: EditorShellProps) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <EditorWorkspace {...props} />
      </LocaleProvider>
    </QueryClientProvider>
  )
}
