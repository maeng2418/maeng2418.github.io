# maeng-v2

Next.js 15+ App Router 기반 재구축을 위한 격리된 Turborepo 모노레포 스캐폴드 (SPEC-MAENGV2-SCAFFOLD-001).

기존 저장소 루트 워크스페이스(`apps/maeng-blog` 등)와 **완전히 분리된 독립 모노레포 루트**다.
루트 `package.json`의 `workspaces`에 등록되지 않으며, 별도로 설치한다:

```bash
cd maeng-v2
yarn install
yarn build   # turbo run build
yarn lint    # turbo run lint
```

## 버전 고정

| 항목 | 값 | 근거 |
|---|---|---|
| Node.js | 24.x (Active LTS, `.nvmrc`) | plan.md §D.2 |
| 패키지 매니저 | Yarn 1.22.19 classic workspaces (`packageManager`) | plan.md §D.1 — 기존 저장소와 일관성 |
| Turborepo | v2.x — `turbo.json`은 v2 스키마의 `tasks` 키 사용 (v1의 `pipeline` 아님) | 신규 설치 버전 기준 |
| ESLint | 9.x flat config | plan.md §D.4 — ESLint 8 EOL |
| TypeScript | 5.x, `strict: true`, `moduleResolution: bundler`, `target: ES2022` (es5 아님) | REQ-006 |

## 구조

```
maeng-v2/
├── apps/
│   ├── maeng-blog/            # SPEC ② — Next.js 15+ App Router 블로그 (구현 완료)
│   └── maeng-editor/          # SPEC ③ — 에디터 (구 maeng-admin 대체, 구현 완료)
├── packages/
│   ├── tsconfig/              # 공유 TS 프리셋 (base.json / nextjs.json)
│   ├── eslint-config-custom/  # ESLint 9 flat config (base / next)
│   └── types/                 # 타입 전용 공유 패키지 (런타임 의존성 없음)
├── package.json               # 독립 워크스페이스 루트
├── turbo.json                 # build / lint / dev 파이프라인
└── .nvmrc                     # Node 24
```

## apps/maeng-blog (SPEC-MAENGV2-BLOG-002 · SPEC-MAENGV2-CONTENT-MIGRATE-004 · SPEC-MAENGV2-ENHANCE-005, 구현 완료)

Next.js 15+ App Router / React 19 기반 블로그 재구축. 기존 Gatsby 기반 `apps/maeng-blog`(루트)는 손대지 않고 병행 유지한다.

- 블로그 목록(`/`) / 상세(`/posts/[slug]`) — 날짜 내림차순, 카테고리 필터, GFM·코드 하이라이트(shiki)·KaTeX
- TIL(`/til`) — 세로 타임라인
- 포트폴리오(`/portfolio`) — 12종 섹션 인벤토리, 스크롤 모션(motion/react), 로케일별 PDF 다운로드, **LUMEN 리디자인** 적용
- **i18n**: `next-intl` 클라이언트 프로바이더 모드(미들웨어·라우트 분리 없음, `messages/{ko,en}.json`) — ko 기본 / en 토글, localStorage 지속, `output: 'export'` 정적 export 보존
- **검색**: pagefind 정적 검색(빌드 후처리 인덱싱, 헤더 검색 모달)
- **RSS**: `out/rss.xml` 자동 생성(비-draft 전건)
- **댓글**: giscus (env 기반 활성화 — 아래 참고)
- **모션**: motion/react 기반 스크롤 리빌·패럴랙스 (`prefers-reduced-motion` 폴백 포함)
- 정적 export 호환(`output: 'export'`) + SEO 기본기(`sitemap.ts` / `robots.ts` / canonical metadata)
- 레거시 워크스페이스 패키지(`maeng-daisyui` 등) 비의존, vitest 테스트 **68건** PASS
- **실 콘텐츠 서빙**: 레거시에서 무변환(copy-only) 이관된 실제 콘텐츠(28포스트 / 121이미지 / 5TIL, 총 154파일)로 서비스 중 — `content/` 하위 checksum 전수 일치, 빌드 산출물 검증 완료

```bash
cd maeng-v2/apps/maeng-blog
yarn dev     # 개발 서버
yarn test    # vitest
yarn build   # 정적 export 빌드 (pagefind 인덱싱 + rss.xml 생성 포함, ../../ 에서 turbo run build --filter=maeng-blog 로도 실행 가능)
```

**giscus 댓글 활성화**: `.env.local`에 다음 4개 env를 모두 설정해야 렌더된다(하나라도 없으면 컴포넌트가 `null` 반환, 빌드/페이지 오류 없음).

```bash
NEXT_PUBLIC_GISCUS_REPO=<owner>/<repo>
NEXT_PUBLIC_GISCUS_REPO_ID=<repo-id>
NEXT_PUBLIC_GISCUS_CATEGORY=<category>
NEXT_PUBLIC_GISCUS_CATEGORY_ID=<category-id>
```

## apps/maeng-editor (SPEC-MAENGV2-EDITOR-003 · SPEC-MAENGV2-ENHANCE-005, 구현 완료)

Next.js 15+ App Router / React 19 기반 마크다운 저작 도구 재구축. 기존 `apps/maeng-admin`(Pages Router, Tiptap 2.x)은 손대지 않고 병행 유지하며, 로컬/개인 도구 전제(인증 없음)로 `yarn dev`만으로 실행한다.

- 에디터: Milkdown 7 기반 마크다운 네이티브 저작 — GFM(테이블·태스크 리스트)·fenced code block·이미지 삽입·링크 편집 (legacy HTML→MD 역변환 파이프라인 폐기)
- **i18n**: `next-intl` 클라이언트 프로바이더 모드(blog와 동일 패턴) — UI 크롬(메뉴/버튼/폼 레이블/상태 메시지) 전 문자열 국제화, `messages/{ko,en}.json`
- **토스트**: sonner — 저장/로드/동기화 성공·실패 알림 (기존 문자열 상태 표시 대체)
- **커맨드 팔레트**: cmdk (⌘K/Ctrl+K) — 포스트 검색·전환, capture 단계 전역 리스너로 Milkdown 키바인딩보다 선행 가로챔
- react-query(`@tanstack/react-query`) 기반 서버 상태 관리(post 목록/저장/로드)
- 블로그 콘텐츠 계약: gray-matter frontmatter 5-키(title/date/category/thumbnail/draft) — `maeng-blog` 로더가 무변환으로 읽는 라운드트립 보장
- 포스트 영속: S3 마크다운 저장/목록/로드(`@aws-sdk/client-s3`), 키 레이아웃 `blog/markdowns/{category}/{fileName}.md`
- 이미지 업로드: Route Handler(`/api/images`, 네이티브 FormData)가 `blog/images/{uuid}.{ext}`로 저장 후 CloudFront URL 응답
- OpenAI 보조 글쓰기: Route Handler(`/api/assist`)가 `OPENAI_MODEL` env 모델로 스트리밍 응답 (모델명 하드코딩 없음)
- 로컬 블로그 미리보기 동기화(capability gate): `BLOG_CONTENT_DIR` 설정 시에만 활성
- 서버 경계·시크릿 규율: AWS/OpenAI SDK는 서버 코드 전용, 시크릿은 `NEXT_PUBLIC_` 미사용
- zod/react-hook-form/ky/Intl 등 최신 라이브러리 채택 (자세한 내용은 CHANGELOG 참조)
- vitest 테스트 **45건** PASS

```bash
cd maeng-v2/apps/maeng-editor
yarn dev     # 로컬 전용 개발 서버 (인증 없음)
yarn test    # vitest
```

## SPEC 시리즈 완료 현황

- **SPEC ①~⑤ 전체 완료**: SCAFFOLD-001(모노레포) → BLOG-002(블로그) → EDITOR-003(에디터) → CONTENT-MIGRATE-004(콘텐츠 이관) → ENHANCE-005(i18n 전환 + 라이브러리 8종)
- **사용자 확인 권장 항목** (자동 검증 불가, 수동 브라우저 시나리오 잔여):
  - blog 검색 UI 시나리오(GWT-2) — 프로덕션 빌드 산출물(`out/`) 서빙 상태에서 실포스트 제목 키워드 검색 → 결과 표시 → 클릭 시 상세 이동
  - editor ⌘K 커맨드 팔레트 시나리오(GWT-3) — 팔레트 열기 → 포스트명 검색·선택 → 로드, Esc로 닫힘 + 포커스 복원

UI 컴포넌트 공유 패키지는 실제 사용처가 생기는 시점에 필요 시 생성한다 (YAGNI — plan.md §D.3, SPEC②/③ 모두 앱 내부에 컴포넌트를 두었다).
콘텐츠 마이그레이션과 저장소 분리(`git subtree`)는 이 스캐폴드 범위 밖이다.
