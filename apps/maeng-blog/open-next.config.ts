// SPEC-MAENGV2-EDITOR-MERGE-006 M4 — @opennextjs/cloudflare 어댑터 설정.
// 서버 타깃(MAENG_BUILD_TARGET=server) 빌드에서만 소비된다(design.md §B D7).
//
// buildCommand를 순수 `next build`로 고정한다 — 기본값은 패키지 매니저의
// "build" 스크립트(`yarn build`, 정적 산출물용 pagefind/RSS 파이프라인 포함)를
// 그대로 실행해, 서버 타깃 빌드(`out/` 미생성)에서 pagefind 단계가 실패한다.
import { defineCloudflareConfig } from '@opennextjs/cloudflare'

const config = defineCloudflareConfig()
config.buildCommand = 'next build'

export default config
