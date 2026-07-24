import type { NextConfig } from 'next'

// 로컬 전용 도구 (plan.md §B.4 확정) — 서버 런타임 실행(yarn dev / next start).
// 정적 export 없음 (REQ-EDITOR-011): S3/OpenAI 호출은 Route Handler/Server Action 서버 경계에서 실행된다.
const nextConfig: NextConfig = {}

export default nextConfig
