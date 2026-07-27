# maeng-blog

Next.js 15 App Router 기반 개인 블로그 + 관리 표면(콘텐츠 저작 도구) 단일 앱 모노레포.

`apps/maeng-blog` 하나의 Next.js 앱이 `MAENG_BUILD_TARGET` 빌드 타임 분기로 두 산출물을 만듭니다 — 공개 정적 블로그(GitHub Pages)와 토큰 인증 관리 표면(Cloudflare Workers). 별도의 저작 도구 앱(`apps/maeng-editor`)은 SPEC-MAENGV2-EDITOR-MERGE-006에서 이 앱으로 완전히 병합되었습니다.

## 구조

```
maeng-blog/
├── apps/
│   └── maeng-blog/            # 단일 앱 — 공개 블로그(정적) + 관리 표면(서버)
├── packages/
│   ├── tsconfig/               # 공유 TS 프리셋 (base.json / nextjs.json)
│   ├── eslint-config-custom/   # ESLint 9 flat config (base / next)
│   └── types/                  # 타입 전용 공유 패키지 (런타임 의존성 없음)
├── package.json                # 워크스페이스 루트
├── turbo.json                  # build / lint / test / dev 파이프라인
└── .github/workflows/          # deploy-pages.yml(GitHub Pages 자동 배포), label-sync.yml
```

## 버전

| 항목 | 값 |
|---|---|
| Node.js | `>=24` |
| 패키지 매니저 | Yarn 1.22.19 classic workspaces |
| Turborepo | v2.x |
| ESLint | 9.x flat config |
| TypeScript | 5.x, `strict: true` |

## apps/maeng-blog

Next.js 15 App Router / React 19 기반. `MAENG_BUILD_TARGET` 환경 변수로 빌드 산출물이 분기됩니다.

### 공개 블로그 (정적 타깃)

- 블로그 목록(`/`) / 상세(`/posts/[slug]`) — 날짜 내림차순, 카테고리 필터, GFM·코드 하이라이트(shiki)·KaTeX
- TIL(`/til`) — 세로 타임라인
- 포트폴리오(`/portfolio`) — 섹션 인벤토리, 스크롤 모션(motion/react), 로케일별 PDF 다운로드
- **i18n**: `next-intl` 클라이언트 프로바이더 모드(`messages/{ko,en}.json`) — ko 기본 / en 토글, localStorage 지속
- **검색**: pagefind 정적 검색(빌드 후처리 인덱싱, 헤더 검색 모달)
- **RSS**: `out/rss.xml` 자동 생성(비-draft 전건)
- **댓글**: giscus (env 기반 활성화 — 아래 참고)
- **모션**: motion/react 기반 스크롤 리빌·패럴랙스 (`prefers-reduced-motion` 폴백 포함)
- 정적 export(`output: 'export'`) + SEO 기본기(`sitemap.ts` / `robots.ts` / canonical metadata)

```bash
yarn workspace maeng-blog dev     # 개발 서버 (정적 타깃)
yarn workspace maeng-blog test    # vitest
yarn workspace maeng-blog build   # 정적 export 빌드 (pagefind 인덱싱 + rss.xml 생성 포함)
```

**giscus 댓글 활성화**: `.env.local`에 다음 4개 env를 모두 설정해야 렌더된다(하나라도 없으면 컴포넌트가 `null` 반환, 빌드/페이지 오류 없음).

```bash
NEXT_PUBLIC_GISCUS_REPO=<owner>/<repo>
NEXT_PUBLIC_GISCUS_REPO_ID=<repo-id>
NEXT_PUBLIC_GISCUS_CATEGORY=<category>
NEXT_PUBLIC_GISCUS_CATEGORY_ID=<category-id>
```

### 관리 표면 — 콘텐츠 저작 도구 (서버 타깃, 토큰 인증)

- 에디터: Milkdown 기반 마크다운 네이티브 저작 — GFM(테이블·태스크 리스트)·fenced code block·이미지 삽입·링크 편집
- **저장 = 발행**: GitHub Contents API로 `main` 브랜치에 직접 커밋(`content/markdowns/{category}/{fileName}.md`). 커밋 push가 GitHub Actions 배포를 트리거해 공개 블로그에 즉시 반영됨
- **인증**: 공유 비밀 토큰(`EDITOR_AUTH_TOKEN`) 기반 게이트 — 미들웨어 + 라우트 핸들러 2계층, 상수 시간 비교. 로컬은 `EDITOR_AUTH_DISABLED=1`로 우회
- **이미지 업로드**: `/api/images` Route Handler가 `content/images/{uuid}.{ext}`로 커밋(10 MiB 상한)
- **AI 보조 글쓰기**: `/api/assist` Route Handler가 `fetch` 직접 호출로 OpenAI Chat Completions API 스트리밍(`OPENAI_MODEL` env, 하드코딩 없음)
- **포스트별 수정 진입점**: 서버 타깃 포스트 상세에서 `/editor?path={category}/{fileName}` 딥링크로 기존 글 편집(정적 산출물에는 빌드 타임에 완전 배제)
- 로컬 개발용 `fs` 드라이버(`EDITOR_STORAGE_DRIVER=fs`) — GitHub env 불필요
- 커맨드 팔레트: cmdk (⌘K/Ctrl+K)
- react-query(`@tanstack/react-query`) 기반 서버 상태 관리

```bash
MAENG_BUILD_TARGET=server yarn workspace maeng-blog dev      # 관리 표면 개발 서버
MAENG_BUILD_TARGET=server yarn workspace maeng-blog build:server  # 서버 타깃 빌드
yarn workspace maeng-blog deploy:cf   # Cloudflare Workers 배포 (opennextjs-cloudflare build + wrangler deploy)
```

**관리 표면 로컬 환경 변수** (`.env.local` 또는 `.dev.vars`):

```bash
EDITOR_AUTH_TOKEN=<openssl rand -hex 32>   # 또는 EDITOR_AUTH_DISABLED=1(로컬 우회)
EDITOR_STORAGE_DRIVER=fs                    # 또는 github (GITHUB_TOKEN/GITHUB_REPO_OWNER/GITHUB_REPO_NAME/GITHUB_BRANCH 필요)
OPENAI_API_KEY=...
OPENAI_MODEL=...
```

## 배포

| 표면 | 대상 | 트리거 |
|---|---|---|
| 공개 블로그(정적) | GitHub Pages | `main` push(`.github/workflows/deploy-pages.yml`) 또는 `workflow_dispatch` 수동 실행 |
| 관리 표면(서버) | Cloudflare Workers(`*.workers.dev`, 무료 플랜) | `yarn workspace maeng-blog deploy:cf` 수동 배포 |

## 품질 검증

```bash
yarn lint    # turbo run lint (ESLint 9 flat config)
yarn test    # turbo run test (vitest)
```

TypeScript strict 모드 + 공유 tsconfig 프리셋(`packages/tsconfig`)으로 타입 안전성을 보장합니다.

## SPEC 이력

이 리포지토리는 SPEC 기반 워크플로(MoAI-ADK)로 개발됩니다. 주요 SPEC:

- SPEC-MAENGV2-SCAFFOLD-001 ~ ENHANCE-005: 모노레포 스캐폴드 / 블로그 재구축 / (구)저작 도구 앱 / 콘텐츠 이관 / i18n 전환
- **SPEC-MAENGV2-EDITOR-MERGE-006**: 별도 저작 도구 앱을 `apps/maeng-blog`로 병합, S3/CloudFront 스토리지를 GitHub 커밋 스토리지로 대체, GitHub Pages(공개) + Cloudflare Workers(관리) 듀얼 배포 도입, 앱 계층 토큰 인증 도입

세부 이력은 `.moai/specs/` 및 git 커밋 히스토리를 참조하세요.
