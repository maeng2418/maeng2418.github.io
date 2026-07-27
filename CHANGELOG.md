# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다. 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 참고합니다.

## [Unreleased]

### Added (SPEC-MAENGV2-EDITOR-MERGE-006)

- **에디터 앱 병합**: 별도 저작 도구 앱(`apps/maeng-editor`)의 전체 기능(Milkdown WYSIWYG 에디터, 커맨드 팔레트, AI 글쓰기 보조, 콘텐츠 계약 모듈)을 `apps/maeng-blog`로 흡수 — `/editor` 경로 아래 배치, `MAENG_BUILD_TARGET` 환경 변수 하나로 정적 export(공개 블로그) / 서버 런타임(관리 표면) 두 산출물을 분기하는 단일 코드베이스로 통합
- **GitHub 커밋 스토리지**: 저작 도구의 영속 계층을 AWS S3/CloudFront에서 GitHub Contents API 직접 커밋(`main` 브랜치, `content/markdowns/{category}/{fileName}.md` · `content/images/{uuid}.{ext}`)으로 전환. 저장 = 발행 모델(커밋이 GitHub Actions 배포를 트리거). 로컬 개발용 `fs` 드라이버(`EDITOR_STORAGE_DRIVER=fs`)와 운영용 `github` 드라이버를 `PostStore`/`ImageStore` 계약으로 교체 가능하게 추상화
- **듀얼 배포**: 공개 정적 블로그는 GitHub Pages(`.github/workflows/deploy-pages.yml`, `main` push 시 자동 빌드·배포), 관리 표면(에디터 + API + 인증)은 Cloudflare Workers(`*.workers.dev`, `@opennextjs/cloudflare` 어댑터, `yarn deploy:cf` 수동 배포)로 분리
- **앱 계층 토큰 인증**: 공유 비밀 토큰(`EDITOR_AUTH_TOKEN`) 기반 게이트 — 미들웨어(`middleware.server.ts`) + 라우트 핸들러 2계층, 상수 시간 비교(고정 길이 해시 + 누적 XOR), HMAC 파생 세션 쿠키(`/editor/login`). 로컬 개발은 `EDITOR_AUTH_DISABLED=1`로 우회
- **포스트별 수정 진입점**: 서버 타깃의 포스트 상세 페이지(`/posts/[...slug]`)에 `/editor?path={category}/{fileName}` 딥링크로 기존 글을 이어 편집하는 진입점 추가. 정적 export 빌드에서는 빌드 타임 분기(`pageExtensions`)로 완전 배제(런타임 숨김 방식 미사용)
- **GitHub Actions 자동 배포**: `.github/workflows/deploy-pages.yml` 신규 — `main` push(블로그 경로 스코프) 또는 `workflow_dispatch` 트리거로 정적 빌드(이미지 동기화 → Next 빌드 → pagefind 인덱싱 → RSS 생성) 후 GitHub Pages에 자동 배포
- **Worker 번들 크기 최적화**: shiki 세밀 번들(fine-grained import) + `rehype-pretty-code` patch-package 패치로 Cloudflare Workers 번들을 3 MiB 무료 플랜 상한 대비 1709.83 KiB(약 44%)로 축소

### Changed

- 배포 대상 리포지토리를 기존 `maeng2418/maeng2418.github.io`(GitHub Pages 규칙상 계정명과 일치하는 기존 공개 리포)로 확정 — 레거시 Gatsby 빌드는 `legacy-gatsby` 브랜치로 보존, 리포 default_branch를 `master` → `main`으로 전환
- AI 글쓰기 보조(`/api/assist`)의 OpenAI 연동을 `openai` npm SDK에서 `fetch` 직접 호출 + SSE 수동 파싱으로 재작성(Worker 번들 크기 제약 대응, 동작 계약은 동일 유지)
- 로케일 상태 관리(`LocaleProvider`, `lib/i18n/locale.ts`)를 단일 구현으로 일원화, 에디터 UI 문자열을 기존 `messages/{ko,en}.json` 카탈로그에 병합

### Removed

- `apps/maeng-editor` 앱 전체 제거(워크스페이스 태스크 오케스트레이션 및 잔여 참조 정리 포함)
- AWS S3 클라이언트 의존성 및 CloudFront 기반 이미지 서빙 코드 경로 제거(이미 발행된 콘텐츠의 CloudFront 참조 0건 확인 — 회귀 없음)

### Verification

- 86개 인수 기준(AC) 중 74건 PASS, 12건 ENV-GATED(Cloudflare Workers 실 배포 필요 — 사용자 OPS 대기, FAIL 0건)
- 전체 vitest 157건 통과, `yarn lint` 실패 0, `tsc --noEmit` 오류 0
- 정적 배포 라이브 검증: `https://maeng2418.github.io/` HTTP 200 확인
- 기존 콘텐츠 렌더 무회귀: 포스트 28건 `<article>` 바이트 동일, pagefind/RSS/sitemap 카운트 무변경
