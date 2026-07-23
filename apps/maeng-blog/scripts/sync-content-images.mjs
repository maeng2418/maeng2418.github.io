// 빌드타임 이미지 동기화 — content/images/* 를 public/content-images/* 로 복사한다.
// 레거시 마크다운의 `../../images/<name>` 참조는 콘텐츠 계층이 `/content-images/<name>`
// 으로 재작성하므로(REQ-BLOG-002), 이 스크립트가 해당 URL 을 서빙 가능하게 만든다.
// SPEC ④ 는 content/images/ 에 파일 복사만 하면 된다 (무변환 계약).
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(appRoot, 'content', 'images')
const destDir = join(appRoot, 'public', 'content-images')

if (existsSync(srcDir)) {
  mkdirSync(destDir, { recursive: true })
  cpSync(srcDir, destDir, { recursive: true })
  console.log(`[sync-content-images] copied ${srcDir} -> ${destDir}`)
} else {
  console.log('[sync-content-images] no content/images directory — skipped')
}
