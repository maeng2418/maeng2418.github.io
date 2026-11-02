'use client'

// 목록 상단 히어로 — 시안 M1: 상태 pill + 그라디언트 sheen 헤드라인 + 소개 + 메타 행.
// 배경 그리드와 커서 글로우는 BlogBackdrop 이 담당한다.
import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'

export default function BlogHero({
  postCount,
  categoryCount,
  yearFrom,
  yearTo,
  latestMonth,
}: {
  postCount: number
  categoryCount: number
  yearFrom: number
  yearTo: number
  /** "2024. 09" — 최신 글의 연·월 */
  latestMonth: string
}) {
  const t = useTranslations('blog')
  const reduced = useReducedMotion()
  const fade = (delay: number) =>
    reduced
      ? {}
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay } }

  return (
    <section className="relative flex flex-col gap-6 pt-20 pb-12 md:pt-24">
      <motion.span {...fade(0)} className="spot-pill">
        <span className="spot-dot" aria-hidden="true" />
        {t('status', { month: latestMonth })}
      </motion.span>
      <motion.h1
        {...fade(0.08)}
        className="spot-h1 max-w-[12em] text-[44px] leading-[1.06] tracking-[-0.045em] md:text-[76px] md:leading-[1.04]"
      >
        {t('headline1')}
        <br />
        {t('headline2')}
      </motion.h1>
      <motion.p {...fade(0.18)} className="max-w-[34em] text-lg leading-[1.7] text-ink-soft">
        {t('intro')}
      </motion.p>
      <motion.div
        {...fade(0.26)}
        className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[13px] text-ink-faint"
      >
        <span>{t('postCount', { count: postCount })}</span>
        <span>{t('categoryCount', { count: categoryCount })}</span>
        <span>
          {yearFrom} – {yearTo}
        </span>
        <a href="/rss.xml">RSS</a>
        <a href="https://github.com/maeng2418">GitHub</a>
      </motion.div>
    </section>
  )
}
