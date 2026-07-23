import type { Metadata } from 'next'
import PortfolioScroll from '@/components/portfolio/PortfolioScroll'

// 포트폴리오 (`/portfolio`) — REQ-BLOG-006/007, AC-BLOG-006/007
// 콘텐츠/모션은 클라이언트 컴포넌트(PortfolioScroll)가 담당 — 로케일 토글이 콘텐츠와
// 다운로드 대상 PDF 를 함께 전환한다. 정적 라우트 (output: 'export' 호환, REQ-BLOG-008).

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    '복잡한 문제를 해결하고 직관적인 경험을 만드는 프론트엔드 개발자, 김명성의 포트폴리오.',
  alternates: { canonical: '/portfolio/' }, // REQ-BLOG-011
}

export default function PortfolioPage() {
  return <PortfolioScroll />
}
