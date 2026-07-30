# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다. 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 참고합니다.

## [Unreleased]

### Fixed (SPEC-MAENGV2-PORTFOLIO-SCROLL-007)

- **커리어 카드 휠 트랩 제거**: `.pf-career-card`의 `position:absolute; overflow-y:auto` 내부 스크롤 컨테이너를 제거하고 grid 자연 높이 스택으로 교체 — 휠 입력이 카드 내부에 갇히지 않고 페이지 스크럽으로 일관되게 소비됨 (`apps/maeng-blog/src/app/globals.css`)
- **핀 높이 단일 정의 지점 도입**: 4개 핀 섹션의 인라인 하드코딩(240/300/330/220vh)을 `apps/maeng-blog/src/components/portfolio/pin-config.ts`(`PIN_HEIGHTS_VH`, `pinHeight()`)로 이동 — 핀 높이와 스크럽 offset 매핑이 단일 소스에서 파생되도록 정리 (`PortfolioScroll.tsx`)
- **모바일 뷰포트 안정화**: `.pf-frame` 높이를 스크롤 중 재계산되는 `100dvh`에서 안정 단위(`100svh`, `100vh` 폴백)로 교체 — 모바일 URL 바 축소/확장에 따른 핀 프레임 레이아웃 출렁임 제거
- **페인트 비용 절감**: `.pf-ribbons`의 `blur(70px)` 전역 블러를 사전 계산된 radial-gradient 소프트 필드로 대체, 정적 표면의 `will-change` 선언 전량 제거, `pointer: coarse`/모바일 폭 미디어 쿼리로 `.pf-glass` blur·saturate 하향 분기 추가
- **스크롤 측정 경로 IntersectionObserver 교체**: 이벤트당 다중 `getBoundingClientRect` 판독 방식의 scroll 핸들러를 제거하고 IntersectionObserver(중앙선 rootMargin -50%/-50%) 기반 활성 챕터 판정으로 교체, 수평 레일 `railMax`는 ResizeObserver로 재측정 — 판정·측정 순수 로직을 `apps/maeng-blog/src/components/portfolio/scroll-logic.ts`(`pickActiveChapter`, `computeRailMax`)로 분리해 단위 테스트 보강
- **챕터 내비 즉시 이동**: 포트폴리오 내부 챕터 내비게이션 이동을 전역 `scroll-behavior: smooth`를 우회하는 instant 프로그램 이동으로 교체 — 300vh+ 핀 구간을 가로지르는 어색한 smooth 재생 제거, 전역 스코프·타 페이지 앵커 동작 무변경
- 검증: `acceptance.md` 총 30개 AC 중 기계 검증만으로 PASS 17건, 기계 검증 PASS + 수동 확인 병행 필요 3건, 순수 수동 검증 대기(MANUAL-PENDING) 10건 — FAIL 0건, 스크롤 체감·육안 확인이 필요한 항목(13건)은 사용자 수동 검증 대기 — `yarn workspace maeng-blog test` 26 files/164 pass(신규 7건), `lint`/`build` 각 exit 0

#### M6 amendment — 사용자 수동 검증 피드백 반영 (`f36deab..015bcaa`)

사용자가 위 sync 이후 수동 검증 시나리오를 직접 수행하며 발견한 UX 이슈 7건 + 보충 요청 5건을 반영한 재종결 라운드.

- **핀 전환 3곳 추가**: About(`pf-s1`)·Creed(`pf-s4`)·Skills(`pf-s6`) 섹션을 일반 흐름에서 짧은 핀(180~270vh)으로 전환 — 정지 없이 흘러가던 증상 제거, `pin-config.ts`의 `PIN_HEIGHTS_VH` 단일 정의 지점에서 파생
- **About 지표 카운트업 제거**: `Figure` 컴포넌트의 수치 상승 애니메이션(eased/useMotionValueEvent)을 삭제하고 항상 `value.toFixed(dec)` 최종값을 정적 렌더 — 등장 스태거만 유지
- **컨택트 시각 효과 제거**: 코발트 색반전 플러드(`.pf-flood`/`.flooded`)와 헤드라인 페이드 오버라이드를 삭제 — `.pf-bleed` 100vw breakout 제거로 Windows 가로 오버플로 잔여 위험도 함께 해소, 버튼은 테마 CSS 변수로 토큰화(EN 로케일 비가시 버그 해결)
- **레일·게이지·칩 정합 보정**: 수평 레일 후행 스페이서로 마지막 카드 도달 불가 문제 해결, 경력 핀 진입 시 빈 프레임 노출 제거, 타임라인 게이지 최상단 항목 미점등 수정, 다크 모드 비강조 칩 저대비 개선
- **전 섹션 리빌 조기 완료 + 머무름 확대**: `PinReveal` 스태거를 압축(폭 0.16→0.12, 시작 지연 축소)해 각 핀 구간 초반(~30%)에 콘텐츠 노출을 완료시키고, 나머지 구간을 순수 머무름(hold)으로 확보
- **전 핀 높이 ~30% 상향**: intro 300 / about 280 / projects 380 / career 420 / creed·skills 270 / contact 280(vh) — 스크럽 여유 확대로 체감 속도 완화
- 검증: `yarn workspace maeng-blog lint` exit 0 / `tsc --noEmit` exit 0 / `yarn workspace maeng-blog test` 26 files·165 pass(신규 1건 = pin-config 완전성) / `yarn workspace maeng-blog build` exit 0 — 매 보충 커밋마다 전체 배치 재실행. 스크롤 체감 검증은 사용자가 반복 라운드로 직접 수행(잔여 미검증: 모바일 실기기, reduced-motion 실기기, Windows 스크롤바 환경)

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
