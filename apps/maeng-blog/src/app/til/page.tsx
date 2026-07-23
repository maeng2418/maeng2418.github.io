import type { Metadata } from 'next'
import { getTilEntriesWithHtml } from '@/lib/content/loader'
import 'katex/dist/katex.min.css'

// TIL (`/til`) — REQ-BLOG-005, AC-BLOG-005
// 세로 타임라인 레이아웃 (승인 시안 maeng-blog-design-direction.html §03 — 최신 항목만 액센트 라인 강조).
// 빌드타임 정적 산출 — output: 'export' 호환 (REQ-BLOG-008)

export const metadata: Metadata = {
  title: 'TIL',
  description: 'Today I Learned — 오늘 배운 것을 짧게 기록합니다.',
  alternates: { canonical: '/til/' }, // REQ-BLOG-011
}

export default async function TilPage() {
  const entries = await getTilEntriesWithHtml()

  return (
    <section className="py-16 md:py-24" aria-label="TIL 타임라인">
      <header>
        <p className="mb-3 text-xs font-bold tracking-[0.14em] uppercase text-accent">TIL</p>
        <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-balance md:text-5xl">
          오늘 배운 것<span className="text-accent">.</span>
        </h1>
        <p className="mt-5 max-w-[62ch] text-lg text-ink-soft">
          매일의 작은 배움을 시간순으로 기록합니다.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="py-24 text-center text-ink-faint">아직 기록이 없어요.</p>
      ) : (
        <ol className="mt-14 space-y-10">
          {entries.map((entry, index) => {
            const latest = index === 0
            return (
              <li
                key={entry.slug}
                data-latest={latest ? 'true' : 'false'}
                className="flex gap-5 md:gap-7"
              >
                {/* 타임라인 세로 라인 — 최신 항목만 액센트 (승인 시안 패리티) */}
                <div
                    aria-hidden
                    className={`w-[2px] shrink-0 self-stretch rounded-full ${latest ? 'bg-accent' : 'bg-line'}`}
                />
                <article className="min-w-0 flex-1 pb-2">
                  <p
                    className={`text-[13px] font-semibold tracking-[0.08em] uppercase ${
                      latest ? 'text-accent' : 'text-ink-faint'
                    }`}
                  >
                    {entry.dateFormatted}
                    {latest && (
                      <span className="ml-2 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-bold tracking-[0.08em] text-accent">
                        LATEST
                      </span>
                    )}
                  </p>
                  <h2 className="mt-2 text-xl font-bold tracking-[-0.015em] md:text-2xl">
                    {entry.title}
                  </h2>
                  <div
                    className="prose mt-4"
                    dangerouslySetInnerHTML={{ __html: entry.html }}
                  />
                </article>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
