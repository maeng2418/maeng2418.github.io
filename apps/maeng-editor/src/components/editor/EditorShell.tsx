'use client'

// 에디터 셸 — quiet utilitarian 도구 UI (REQ-EDITOR-012: 장식/모션 없음, 밀도 우선)
// M4: 저장/목록/로드(Server Action) + 이미지 업로드 연동. M5: OpenAI 보조 패널.
// M6: 로컬 블로그 미리보기 동기화 (capability gate — blogSyncEnabled prop).
// 폼은 react-hook-form + zod resolver (Formik+Yup 대체 — plan §B.3), 클라이언트 HTTP 는 ky.
import { useState } from 'react'
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
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { listPostsAction, loadPostAction, savePostAction } from '@/app/actions/posts'
import { syncBlogPreviewAction } from '@/app/actions/sync'
import type { PostSummary } from '@/lib/server/posts'

// Milkdown 은 클라이언트 전용(ProseMirror DOM) — SSR 제외
const MilkdownEditor = dynamic(() => import('./MilkdownEditor'), { ssr: false })

const INITIAL_DOC = `# 새 포스트

본문을 입력하세요.
`

const PostMetaSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력하세요'),
  category: z.string().trim().min(1, '카테고리를 입력하세요'),
  fileName: z
    .string()
    .trim()
    .min(1, '파일명을 입력하세요')
    .regex(/^[^/\\]+$/, '파일명에 경로 구분자를 쓸 수 없습니다'),
  thumbnail: z.string().trim(),
  draft: z.boolean(),
})

type PostMetaForm = z.infer<typeof PostMetaSchema>

const EMPTY_META: PostMetaForm = {
  title: '',
  category: '',
  fileName: '',
  thumbnail: '',
  draft: false,
}

/** 목록 표기용 날짜 — 네이티브 Intl (의존성 없음) */
const listDateFormat = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

interface EditorShellProps {
  blogSyncEnabled: boolean
}

function EditorWorkspace({ blogSyncEnabled }: EditorShellProps) {
  const queryClient = useQueryClient()

  const form = useForm<PostMetaForm>({
    resolver: zodResolver(PostMetaSchema),
    defaultValues: EMPTY_META,
  })
  const fieldErrors = form.formState.errors

  /** 로드된 포스트의 원본 date (라운드트립 보존) — 신규는 null */
  const [postDate, setPostDate] = useState<string | null>(null)
  const [markdown, setMarkdown] = useState(INITIAL_DOC)
  const [initialDoc, setInitialDoc] = useState(INITIAL_DOC)
  const [docKey, setDocKey] = useState(0)
  const [showSource, setShowSource] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

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
      setStatus(`저장됨 → ${data.key}`)
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (error: Error) => setStatus(`저장 실패: ${error.message}`),
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
      setStatus(`로드됨 ← ${post.key}`)
    },
    onError: (error: Error) => setStatus(`로드 실패: ${error.message}`),
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      const result = await syncBlogPreviewAction()
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) =>
      setStatus(`미리보기 동기화 완료: 마크다운 ${data.markdowns} · 이미지 ${data.images}`),
    onError: (error: Error) => setStatus(`동기화 실패: ${error.message}`),
  })

  const newPost = () => {
    form.reset(EMPTY_META)
    setPostDate(null)
    replaceDocument(INITIAL_DOC)
    setStatus(null)
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-4 px-4 py-6">
      {/* 사이드바 — 포스트 목록 + 미리보기 동기화 */}
      <aside className="flex w-64 shrink-0 flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-soft">포스트</h2>
          <button
            type="button"
            onClick={newPost}
            className="rounded border border-line px-2 py-0.5 text-xs text-ink-soft hover:bg-accent-soft hover:text-accent"
          >
            새 포스트
          </button>
        </div>
        <div className="max-h-[28rem] overflow-y-auto rounded-md border border-line bg-card">
          {postsQuery.isLoading && <p className="p-3 text-xs text-ink-faint">목록 불러오는 중…</p>}
          {postsQuery.isError && (
            <p className="p-3 text-xs text-red-500">
              목록 실패: {(postsQuery.error as Error).message}
            </p>
          )}
          {postsQuery.data?.length === 0 && (
            <p className="p-3 text-xs text-ink-faint">저장된 포스트 없음</p>
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
            {syncMutation.isPending ? '동기화 중…' : '블로그 미리보기 동기화'}
          </button>
        )}
      </aside>

      {/* 메인 — 메타데이터 폼 + 에디터 + 보조 패널 */}
      <main className="flex min-w-0 flex-1 flex-col gap-3">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-bold">maeng-editor</h1>
          <button
            type="button"
            onClick={() => setShowSource((v) => !v)}
            className="rounded border border-line px-2 py-1 text-xs text-ink-soft hover:bg-accent-soft hover:text-accent"
          >
            {showSource ? '마크다운 숨기기' : '마크다운 보기'}
          </button>
        </header>

        <form
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
          className="grid grid-cols-2 gap-2 rounded-md border border-line bg-card p-3"
        >
          <MetaField label="제목" error={fieldErrors.title?.message}>
            <input type="text" {...form.register('title')} className={inputClass} />
          </MetaField>
          <MetaField label="카테고리" error={fieldErrors.category?.message}>
            <input
              type="text"
              placeholder="development"
              {...form.register('category')}
              className={inputClass}
            />
          </MetaField>
          <MetaField label="파일명" error={fieldErrors.fileName?.message}>
            <input
              type="text"
              placeholder="my_post (확장자 없이)"
              {...form.register('fileName')}
              className={inputClass}
            />
          </MetaField>
          <MetaField label="썸네일 URL (선택)" error={fieldErrors.thumbnail?.message}>
            <input type="text" {...form.register('thumbnail')} className={inputClass} />
          </MetaField>
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            <input type="checkbox" {...form.register('draft')} />
            draft (블로그 비게시)
          </label>
          <div className="flex items-center justify-end gap-2">
            {postDate && <span className="text-xs text-ink-faint">date: {postDate}</span>}
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {saveMutation.isPending ? '저장 중…' : 'S3 저장'}
            </button>
          </div>
        </form>

        {status && (
          <p className="rounded border border-line bg-card px-3 py-1.5 text-xs text-ink-soft">
            {status}
          </p>
        )}

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
        throw new Error(json?.error ?? `요청 실패 (HTTP ${response.status})`)
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
      <h2 className="text-sm font-semibold text-ink-soft">AI 보조 글쓰기</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void run()
          }}
          placeholder="예: 이 글의 결론 문단을 초안으로 작성해줘"
          className={`flex-1 ${inputClass}`}
        />
        <button
          type="button"
          onClick={() => void run()}
          disabled={busy || !prompt.trim()}
          className="rounded border border-line px-3 py-1.5 text-sm text-ink-soft hover:bg-accent-soft hover:text-accent disabled:opacity-50"
        >
          {busy ? '생성 중…' : '요청'}
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
              문서 끝에 삽입
            </button>
            <button
              type="button"
              onClick={() => setOutput('')}
              className="rounded border border-line px-2 py-1 text-xs text-ink-faint hover:text-ink-soft"
            >
              버리기
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
      <EditorWorkspace {...props} />
    </QueryClientProvider>
  )
}
