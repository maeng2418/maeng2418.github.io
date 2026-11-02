import type { Metadata } from 'next'
import PortfolioScroll from '@/components/portfolio/PortfolioScroll'

// 포트폴리오 (`/portfolio`) — 시안 v18 (D안 v2 스크럽 문법)
// 콘텐츠/모션은 클라이언트 컴포넌트(PortfolioScroll)가 담당 — 로케일 토글이 콘텐츠와
// 다운로드 대상 PDF 를 함께 전환한다. 정적 라우트 (output: 'export' 호환, REQ-BLOG-008).

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    '레거시를 무중단으로 전환하고, 판단의 근거를 RFC로 남겨 팀의 표준으로 정착시키는 프론트엔드 엔지니어 김명성의 포트폴리오.',
  alternates: { canonical: '/portfolio/' }, // REQ-BLOG-011
}

export default function PortfolioPage() {
  return <PortfolioScroll />
}
