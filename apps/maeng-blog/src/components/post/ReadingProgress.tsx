'use client'

// 상단 읽기 진행 바 — 스크롤 비율을 scaleX 로 반영 (rAF 1회 합치기)
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

export default function ReadingProgress() {
  const t = useTranslations('post')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = ref.current
      if (!el) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0
      el.style.transform = `scaleX(${ratio})`
      el.setAttribute('aria-valuenow', String(Math.round(ratio * 100)))
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-label={t('progressAria')}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className="post-progress"
    />
  )
}
