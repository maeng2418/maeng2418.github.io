'use client'

// 목록 배경 — 상단 그리드 패턴 + 커서를 따라오는 글로우 (시안 M1). 포인터 좌표는 CSS 변수로만 갱신한다.
import { useEffect, useRef } from 'react'

export default function BlogBackdrop() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const onMove = (event: globalThis.PointerEvent) => {
      const el = glowRef.current
      if (!el) return
      el.style.setProperty('--gx', `${event.clientX}px`)
      el.style.setProperty('--gy', `${event.clientY + window.scrollY}px`)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <>
      <div className="spot-bg" aria-hidden="true" />
      <div ref={glowRef} className="spot-glow" aria-hidden="true" />
    </>
  )
}
