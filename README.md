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
├── apps/                      # (비어 있음) SPEC ②③이 채운다
│   ├── maeng-blog/            # ← SPEC ② Next.js 15+ App Router 블로그
│   └── maeng-editor/          # ← SPEC ③ 에디터 (구 maeng-admin)
├── packages/
│   ├── tsconfig/              # 공유 TS 프리셋 (base.json / nextjs.json)
│   ├── eslint-config-custom/  # ESLint 9 flat config (base / next)
│   └── types/                 # 타입 전용 공유 패키지 (런타임 의존성 없음)
├── package.json               # 독립 워크스페이스 루트
├── turbo.json                 # build / lint / dev 파이프라인
└── .nvmrc                     # Node 24
```

## 향후 SPEC 시리즈

- **SPEC ②** — `apps/maeng-blog` 재구축 (Next.js 15+ App Router)
- **SPEC ③** — `apps/maeng-editor` 재구축 (구 maeng-admin CMS)
- **SPEC ④** — 기존 콘텐츠(마크다운/이미지) 마이그레이션

UI 컴포넌트 공유 패키지는 실제 사용처가 생기는 SPEC ②③에서 생성한다 (YAGNI — plan.md §D.3).
콘텐츠 마이그레이션과 저장소 분리(`git subtree`)는 이 스캐폴드 범위 밖이다.
