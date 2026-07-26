import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

// M4 — Cloudflare Workers 로컬 개발(next dev) 시 bindings(env/secrets)를 주입한다(공식 권장 패턴).
// 서버 타깃이 아닐 때는 호출하지 않는다 — 정적 타깃 빌드에는 영향이 없다(design.md §B D7).
if (process.env.MAENG_BUILD_TARGET === 'server') {
  initOpenNextCloudflareForDev()
}

// 듀얼 빌드 타깃 분기 (SPEC-MAENGV2-EDITOR-MERGE-006 design.md §B D1).
// MAENG_BUILD_TARGET 미지정 시 기본값은 'static' — 기존 gh-pages 정적 배포 계약(REQ-DEPLOY-004) 무변경 유지.
// 'server' 타깃은 *.server.ts(x) 확장자를 pageExtensions에 추가해 서버 전용 라우트(에디터·API·미들웨어)를
// 라우트 트리에 포함시킨다. 정적 타깃에서는 해당 확장자가 pageExtensions에 없으므로
// 파일이 존재해도 라우트로 인식되지 않는다(빌드 타임 배제, REQ-DEPLOY-002/005).
const target = process.env.MAENG_BUILD_TARGET ?? 'static' // 'static' | 'server'
const isStatic = target === 'static'

// 이미지 최적화 런타임이 없으므로 unoptimized 전제 (plan.md §B.2).
const nextConfig: NextConfig = {
  ...(isStatic ? { output: 'export' as const } : {}),
  // design.md §B D9 — 컴파일 타임 리터럴 인라인. 정적 빌드에서 IS_SERVER_TARGET이 리터럴 false가 되어
  // 수정 진입점(PostEditEntry) import·마크업이 dead-code로 제거된다(REQ-EDIT-002).
  env: { MAENG_BUILD_TARGET: target },
  // 정적 타깃(GitHub Pages)만 디렉터리 스타일 URL이 필요하다. 서버 타깃에서 trailingSlash를
  // 강제하면 /api/* 요청이 308로 리다이렉트되어 인증 헤더 기반 curl 검증(AC-M4-*)이 깨진다.
  trailingSlash: isStatic,
  images: {
    unoptimized: true,
  },
  pageExtensions: isStatic
    ? ['tsx', 'ts']
    : ['tsx', 'ts', 'server.tsx', 'server.ts'],
}

export default nextConfig
