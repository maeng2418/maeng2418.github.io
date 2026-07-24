'use client'

// pagefind 정적 검색 진입점 — REQ-ENH-005 (design.md §3)
// 인덱스(out/pagefind/)는 빌드 후에만 존재하므로 모달 오픈 시점에 동적 로드한다.
// dev 모드에서는 로드 실패를 1회 캐치해 안내 문구로 처리 (콘솔 오류 무한 루프 금지 — §D.2).
// 커스텀 모달(JS API) — 정적 export 호환, 디자인 토큰 스타일, quiet (시각 리디자인 금지).
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

interface SearchResultItem {
  url: string
  title: string
  /** pagefind 발췌 — 매치 하이라이트 <mark> 포함 HTML */
  excerpt: string
}

interface PagefindResult {
  data: () => Promise<{ url: string; excerpt: string; meta: { title?: string } }>
}

interface PagefindModule {
  debouncedSearch: (query: string) => Promise<{ results: PagefindResult[] } | null>
}

/** 인덱스 로드는 성공/실패 모두 1회로 고정 (실패 재시도 루프 금지) */
let pagefindPromise: Promise<PagefindModule | null> | null = null

function loadPagefind(): Promise<PagefindModule | null> {
  if (!pagefindPromise) {
    pagefindPromise =
      // @ts-expect-error — 빌드 산출물(out/pagefind/) 전용 런타임 경로. 번들러가 해석하지 않는다.
      import(/* webpackIgnore: true */ '/pagefind/pagefind.js')
        .then((module: PagefindModule) => module)
        .catch(() => null)
  }
  return pagefindPromise
}

const MAX_RESULTS = 10

export default function Search({
  defaultOpen = false,
}: {
  /** 테스트 전용 초기 오픈 상태 — 런타임 기본은 닫힘 */
  defaultOpen?: boolean
}) {
  const t = useTranslations('search')
  const [open, setOpen] = useState(defaultOpen)
  const [query, setQuery] = useState('')
  const [unavailable, setUnavailable] = useState(false)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // 검색 실행 — pagefind.debouncedSearch 가 스테일 질의를 null 로 반환한다
  useEffect(() => {
    if (!open || !query.trim()) {
      setResults([])
      return
    }
    let cancelled = false
    void (async () => {
      const pagefind = await loadPagefind()
      if (cancelled) return
      if (!pagefind) {
        setUnavailable(true)
        return
      }
      const response = await pagefind.debouncedSearch(query)
      if (cancelled || !response) return
      const loaded = await Promise.all(
        response.results.slice(0, MAX_RESULTS).map((result) => result.data())
      )
      if (cancelled) return
      setResults(
        loaded.map((item) => ({
          url: item.url,
          title: item.meta.title ?? item.url,
          excerpt: item.excerpt,
        }))
      )
    })()
    return () => {
      cancelled = true
    }
  }, [open, query])

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('openAria')}
        className="text-ink-soft hover:text-accent"
      >
        {t('open')}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[15vh]"
          onClick={close}
          onKeyDown={(event) => {
            if (event.key === 'Escape') close()
          }}
        >
          {/* 내부 클릭이 백드롭 닫힘으로 전파되는 것만 차단 */}
          <div
            role="dialog"
            aria-label={t('title')}
            className="w-full max-w-lg overflow-hidden rounded-md border border-line bg-card shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('placeholder')}
              className="w-full border-b border-line bg-transparent px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            <div className="max-h-80 overflow-y-auto">
              {unavailable ? (
                <p className="px-4 py-8 text-center text-sm text-ink-faint">{t('unavailable')}</p>
              ) : query.trim() && results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-faint">{t('empty')}</p>
              ) : (
                <ul>
                  {results.map((result) => (
                    <li key={result.url} className="border-b border-line last:border-b-0">
                      <a href={result.url} className="block px-4 py-3 no-underline hover:bg-accent-soft">
                        <span className="block text-sm font-bold text-ink">{result.title}</span>
                        <span
                          className="mt-1 block text-xs leading-relaxed text-ink-soft [&_mark]:bg-accent-soft [&_mark]:text-accent"
                          dangerouslySetInnerHTML={{ __html: result.excerpt }}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
