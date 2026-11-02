// 스포트라이트 카드 공용 포인터 핸들러 — 커서 위치를 가장 가까운 .spot-card 의 CSS 변수(--x/--y)로 흘린다.
// 목록 그리드와 상세의 네비 카드가 같이 쓴다. 리렌더 없이 DOM 스타일만 갱신.
import type { PointerEvent } from 'react'

export function trackSpotlight(event: PointerEvent<HTMLElement>): void {
  const card = (event.target as HTMLElement).closest<HTMLElement>('.spot-card')
  if (!card) return
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--x', `${event.clientX - rect.left}px`)
  card.style.setProperty('--y', `${event.clientY - rect.top}px`)
}
