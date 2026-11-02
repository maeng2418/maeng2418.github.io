'use client'

// 플로팅 맨 위로 — 600px 이상 스크롤 시 표시
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const SHOW_AFTER = 600

export default function BackToTop() {
  const t = useTranslations('post')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label={t('backToTop')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`post-top ${visible ? 'is-on' : ''}`}
    >
      ↑
    </button>
  )
}
