// SPEC-MAENGV2-EDITOR-MERGE-006 M4 — @opennextjs/cloudflare 어댑터 설정.
// 서버 타깃(MAENG_BUILD_TARGET=server) 빌드에서만 소비된다(design.md §B D7).
import { defineCloudflareConfig } from '@opennextjs/cloudflare'

export default defineCloudflareConfig()
