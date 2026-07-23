import type { NextConfig } from 'next'

// gh-pages 정적 배포 확정 (research.md §5) — output: 'export' 고정.
// 이미지 최적화 런타임이 없으므로 unoptimized 전제 (plan.md §B.2).
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
