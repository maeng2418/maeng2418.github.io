---
title: '[AI News] 2026년 11월 3주차 AI 트렌드 리포트: 결정 모델(Decision Model)의 표준화와 Claude Fable 5.2, Gemini 4 세대 교체'
date: 2026-11-16 09:00:00
category: 'AI News'
draft: false
---

지난 7일(2026년 11월 9일~16일)간 프론트엔드 및 풀스택 엔지니어링 생태계에서 공개된 결정 모델(Decision Model) 표준화 동향, 프론티어 모델 세대 교체, 자바스크립트 AI 툴킷 릴리스, 그리고 MCP 참조 서버 보안 패치를 정리했습니다.

> 💡 **이번 주 핵심 요약 (3줄 요약)**
>
> 1. **결정 모델이 프레임워크 공통 프리미티브로**: 11월 11일 Google이 `gemini-decision-1` 기반 Gemini Decisions API를 공개했고, 같은 날 LangChain이 `@langchain/core/decisions`의 `BaseDecisionModel`을 내놓았습니다. 텍스트를 생성하는 대신 타입이 있는 질문에 확률로 답하는 계층이 도구 선택·라우팅·정책 검사의 표준으로 자리 잡고 있습니다.
> 2. **프론티어 모델 세대 교체**: 11월 9일 Anthropic이 Claude Fable 5.2와 Mythos 5.2를, 11월 10일 Google이 Gemini 4 Carbon을 공개했습니다. 두 곳 모두 코딩·에이전트 워크플로를 전면에 내세우며 가격과 지연을 함께 조정했습니다.
> 3. **Vercel AI SDK 7.0.168~7.0.173 안정화 패치**: `useChat` 메시지 큐, Zod Mini 기반 번들 축소, 도구 오류 텍스트 노출 제어(`redactToolErrors`), `WorkflowAgent`의 `toolApproval`·타임아웃 설정이 추가되었습니다.

---

## 1. This Week in Releases (주요 릴리스 소식)

### 1.1 결정 모델(Decision Model)의 표준화: Gemini Decisions API와 LangChain decisions

Google DeepMind가 11월 11일 Gemini Decisions API를 공개했습니다. `gemini-decision-1` 모델은 텍스트를 토큰 단위로 생성하는 대신, 주어진 후보 선택지를 한 번의 순전파로 채점해 확률과 신뢰도를 돌려줍니다.

- **입력과 질문 구조**: 텍스트·이미지·오디오·비디오·PDF를 하나의 `input`으로 받고, 요청 하나에 최대 1,000개의 독립 질문을 묶어 보냅니다. 컨텍스트는 262,144 토큰이며, 공유 입력은 질문 수와 무관하게 요청당 한 번만 과금됩니다.
- **질문 타입**: `noul`(예/아니오), `choice`(2~255개 선택지), `score`(순서형 루브릭) 세 가지이며, 모든 답변에 0~1 신뢰도가 붙습니다. 질문끼리는 서로를 볼 수 없어 각각 독립적으로 채점됩니다.
- **가격과 지연**: 입력 100만 토큰당 0.10달러이고 출력 토큰은 과금하지 않습니다. Google이 제시한 종단 지연은 150~250ms 수준입니다.
- **연동**: `google-genai` 3.2 이상에서 `client.decisions.create()`로 호출하며, LangChain·Vercel AI SDK·LiteLLM·OpenRouter·Pydantic AI 통합이 함께 배포되고 있습니다. 현재 `v1beta`이며 Vertex AI 지원은 예정 상태입니다.

같은 날 LangChain은 `@langchain/core` 1.4.0에서 결정 모델 계층을 추가했습니다.

- **`@langchain/core/decisions`**: `BaseDecisionModel`은 텍스트·메시지·JSON 상태에 대해 `Noul`(예/아니오), `Choice`, `Score`, `Box` 질문에 답하는 `Runnable`입니다. 질문에서 답변 타입이 추론되고, provider가 질문을 비워 두거나 타입·라벨을 틀리게 주면 응답을 거부합니다.
- **`@langchain/typesafe` 0.1.0**: `TypeSafeClassifier`가 `BaseDecisionModel` 구현으로 옮겨졌습니다. 질문을 생성자가 아니라 요청에 넘기고(`invoke({ state, questions })`), 토큰 사용량이 `usage_metadata`로 바뀌는 호환성 깨짐이 있으므로 마이그레이션 계획이 필요합니다.
- **보안 패치 동반**: 두 패키지 모두 Zod 4.6.6 이상을 요구해 GHSA-mrhx-c7xc-m3w5 영향을 받는 버전을 배제합니다. Zod v3 스키마는 `zod/v3` 엔트리로 계속 지원됩니다.

성능은 벤더 주장과 독립 측정이 갈립니다. 11월 13일 Artificial Analysis Decision Index v2에서 Gemini Decision 1은 66.0으로 22개 모델 중 12위, 기존 TypeSafe Jev 1.14는 66.2로 11위였습니다. 과제당 비용은 100만 과제 기준 Gemini가 345달러, Jev가 156달러였고, 평균 지연은 211ms 대 92ms였습니다. 정확도는 대등하지만 비용과 지연에서는 기존 모델이 앞선다는 뜻이므로, 도입 전 자체 라벨 데이터로 비교하는 편이 안전합니다.

### 1.2 프론티어 모델 업데이트: Claude Fable 5.2 / Mythos 5.2와 Gemini 4 Carbon / Hydrogen

**Anthropic — Claude Fable 5.2 / Mythos 5.2 (11월 9일)**

- **속도와 가격**: 출력 생성 속도가 이전 세대보다 최대 30% 빨라졌고, 가격은 100만 토큰당 입력 8달러·출력 40달러로 5.1 세대보다 20% 낮아졌습니다. fast 모드를 켜면 토큰 생성이 최대 2.5배 빨라지며 입력 16달러·출력 80달러가 적용됩니다.
- **모델 구성**: Fable과 Mythos는 동일한 기반 모델이고, Fable은 사이버·생물 안전장치를 유지해 전체 공개되며 Mythos는 검증 프로그램 참여 조직에만 열립니다. 안전장치는 5.1과 같은 수준이면서 불필요한 차단이 줄었고, 증류 공격 방어가 강화되었습니다.
- **SDK 반영**: `anthropic-sdk-typescript` 1.7.0에 `claude-fable-5-2`, `claude-mythos-5-2` 모델 ID가 추가되었습니다.
- **사용 지침**: Anthropic은 대부분의 코딩·지식 작업에는 Opus 5.5를 기본으로 쓰고, 작업 복잡도에 따라 위로는 Fable·Mythos, 아래로는 Sonnet·Haiku 5.5로 옮기라고 권고했습니다.
- **제품 확장**: 같은 주에 Claude Whiteboards·Sheets·Data가 공개(11월 10일)되고 Claude Meetings가 베타로 시작(11월 12일)되어, 회의·문서 작업 쪽 제품 범위도 넓어졌습니다.

**Google — Gemini 4 Carbon (11월 10일)과 Gemini 4 Hydrogen (11월 12일)**

- **Gemini 4 Carbon**: 1M 토큰 컨텍스트와 `low`·`medium`·`high` 사고 수준을 지원하는 프론티어 모델입니다. Google은 CursorBench 4.0, Perplexity WANDR, Zapier AutomationBench에서 1위를 기록했고 경쟁 모델 대비 과제당 비용이 2배 이상 낮다고 밝혔습니다. 가격은 11월 30일까지 입력 2달러·출력 10달러이며, 12월 1일부터 입력 4달러·출력 20달러가 적용됩니다.
- **`/swarm` 프리뷰**: Antigravity에서 하나의 프롬프트를 여러 에이전트 팀으로 나눠 병렬 워크스페이스에서 실행하고, 변경마다 적대적 검증자를 붙이는 구조를 제공합니다. 설계·조정·감사에는 Carbon을, 병렬 작업에는 가벼운 모델을 배치하는 방식입니다.
- **Gemini 4 Hydrogen**: 일상적인 코딩과 디버깅, 대화형 웹 개발에 맞춘 모델로, 네 단계 사고 수준을 지원하고 Carbon·Argon과 함께 쓰이도록 설계되었습니다. Google은 지시 준수와 허위 주장 감소를 강조했습니다.
- **Orchestrator**: Carbon과 Hydrogen 사이를 한 트레이젝션 안에서 양방향으로 넘기는 동적 라우팅 방식입니다. Carbon이 읽기 전용으로 계획을 세우고 Hydrogen이 편집과 테스트를 맡다가, 막히면 다시 Carbon으로 돌아가는 구조이며 Terminal-Bench 4.1에서 Carbon에 가까운 성공률을 유지하면서 평균 쿼터를 24% 덜 쓰고 19% 더 빨랐다고 Google은 밝혔습니다.

### 1.3 Vercel AI SDK 7.0.168 ~ 7.0.173 (11월 10일 ~ 13일)

이번 주 패치는 기능 추가보다 에이전트 UI의 성능·안정성 결함을 정리하는 데 집중되었습니다.

- **`useChat` 메시지 큐 (7.0.168)**: 응답이 진행 중일 때 보낸 메시지를 `experimental_queue`로 대기시키고, 도구 승인이 먼저 전송되어도 원래 요청 옵션을 유지하며 `sendAutomaticallyWhen`이 비동기로 판단하는 동안 큐를 붙잡습니다(7.0.169).
- **번들 축소 (7.0.169)**: 내부 검증 스키마를 Zod Mini로 교체했습니다. 공개 메시지 스키마의 Zod 메서드와 오류 메시지, Zod 3·4 호환성은 그대로 유지됩니다.
- **UI 메시지 검증 메모리 방어 (7.0.171)**: `validateUIMessages`가 잘못된 파트마다 모든 파트 스키마의 오류를 쌓아 소량 요청으로도 메모리를 고갈시킬 수 있던 문제를, 파트 타입별 1회 검사와 첫 오류 중단으로 바꿨습니다.
- **스트리밍 CPU 최적화 (7.0.170)**: `Output.array`와 `streamObject`가 청크마다 누적 배열 전체를 재검증하던 로직을 완료 원소 단위 증분 파싱으로 교체했습니다.
- **도구 오류 텍스트 표면화 (7.0.171)**: 실패한 도구 호출의 오류 텍스트를 모델이 받은 그대로 UI 메시지에 유지합니다. 이전에는 클라이언트에 "An error occurred."로 치환되어, `convertToModelMessages`로 되돌릴 때 모델이 받은 내용과 달라져 Anthropic 계열에서 400 오류가 발생했습니다. 클라이언트에 상세를 숨기려면 `redactToolErrors: true`를 사용합니다.
- **실험 API의 다운로드 정책 (7.0.172)**: `experimental_extract`·`experimental_decide`에서 원격 파일 URL은 명시적 `experimental_download` 훅을 요구합니다. `createDownload({ fetch })`에 DNS 검증 트랜스포트를 넘기는 방식이 권장됩니다.
- **`WorkflowAgent` 제어 (7.0.173)**: 생성자와 호출 단위로 `toolApproval`을 받고, `{ totalMs, stepMs, firstChunkMs, chunkMs }` 형태의 타임아웃 객체를 지원합니다. `prepareStep` 결과도 `ToolLoopAgent`와 같게 동작하도록 정렬되었습니다.

### 1.4 modelcontextprotocol/servers v2.4.0: 참조 MCP 서버 보안 패치 (11월 11일)

Anthropic의 참조 MCP 서버 모음이 서버 3종의 취약점 6건을 고치는 보안 릴리스를 배포했습니다. 에이전트에 로컬 파일·저장소·웹을 연결해 쓰고 있다면 이번 주에 반드시 버전을 올려야 합니다.

- **`@modelcontextprotocol/server-filesystem` 2.3.0**: 읽기 도구가 검사한 디렉터리를 기준으로 파일을 열도록 바꿔, 검사와 읽기 사이에 디렉터리가 심볼릭 링크로 교체되는 경쟁 조건을 막았습니다. FIFO·소켓·디바이스는 읽지 않고 거부하며, `move_file`도 검사한 원본만 이동합니다. Windows에서는 경쟁 조건이 좁혀지지만 완전히 닫히지는 않습니다.
- **`mcp-server-git` 2026.11.11**: 저장소의 `.git/config`에 적힌 `core.fsmonitor`, `diff.external`, 훅, 필터·머지 드라이버 때문에 읽기 전용 호출이 서버 권한으로 임의 프로그램을 실행할 수 있던 문제를 막았습니다. 모든 Git 명령이 해당 설정을 덮어쓰며, 덮어쓰기를 무시하는 Git 2.31 미만은 거부합니다.
- **`mcp-server-fetch` 2026.11.11**: IPv6 사이트 로컬 대역(`fec0::/10`)을 공인 주소로 판정하던 가드를 수정했고, robots.txt 규칙을 사이트가 실제로 해석할 경로로도 대조해 `//private` 같은 우회를 차단했습니다.
- **업그레이드 주의**: TypeScript 서버들이 날짜 버전에서 시맨틱 버전으로 옮겨가면서 패키지 관리자가 2.3.0을 이전 날짜 버전보다 낮게 판단합니다. `npm install @modelcontextprotocol/server-filesystem@2.3.0`처럼 버전을 명시해 설치해야 합니다.

---

## 2. Weekly Trending Repo (이번 주 급상승 오픈소스)

GitHub 주간 트렌딩(2026년 11월 16일 집계)에서 이번 주 가장 빠르게 성장한 저장소 중 실무 연관성이 높은 세 곳을 골랐습니다.

### 2.1 vercel-labs/agent-browser (이번 주 +4,217 stars)

- **저장소**: [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) (Rust, Apache-2.0, 51,610 stars)
- **최근 릴리스**: v0.42.0(11월 10일), v0.43.0(11월 12일)
- **핵심 특징**:
  - 에이전트가 한 번에 명령 하나씩 브라우저를 조작하는 네이티브 Rust CLI입니다. `snapshot`이 페이지를 `@e1` 같은 참조가 붙은 압축 텍스트(접근성 트리)로 돌려주고, 에이전트는 참조로 명령을 실행한 뒤 다시 읽어 결과를 확인하는 루프를 돕니다.
  - 첫 명령에서 백그라운드 데몬이 뜨고 브라우저를 계속 유지하므로 단계마다 짧은 셸 호출만 발생합니다. 세션마다 데몬과 브라우저가 분리되고, 명령이 한 시간 없으면 상태를 저장한 뒤 종료합니다.
  - 실행 중인 Chrome에 `--cdp`·`--auto-connect`로 붙거나, Lightpanda·Obscura 엔진, iOS 시뮬레이터의 Mobile Safari, Browserbase·Browserless·Browser Use 같은 클라우드 브라우저로 대상을 바꿀 수 있습니다.
  - CLI 버전에 맞는 스킬 문서를 `agent-browser skills get core`로 에이전트에 공급하고, `npx skills add vercel-labs/agent-browser`로 에이전트 하네스에 설치할 수 있습니다.
- **실무 활용**: 로컬 개발 서버의 UI 회귀 확인이나 폼 제출·로그인 같은 E2E 탐색을 에이전트에 맡길 때, 좌표 기반 자동화보다 토큰 소모가 적고 실패 원인이 분명합니다.

### 2.2 anthropics/skills (이번 주 +6,077 stars)

- **저장소**: [anthropics/skills](https://github.com/anthropics/skills) (Python, 195,348 stars)
- **핵심 특징**:
  - 스킬은 지침·스크립트·리소스를 폴더로 묶어 Claude가 필요할 때 동적으로 불러오는 단위이며, 각 스킬은 `SKILL.md`에 지침과 메타데이터를 담는 자기완결 구조입니다.
  - `spec/`에 Agent Skills 명세, `template/`에 스킬 템플릿이 있고, Claude의 문서 기능을 실제로 구동하는 docx·pdf·pptx·xlsx 스킬도 Apache-2.0으로 공개되어 있습니다. 저장소의 모든 스킬이 같은 라이선스는 아니므로 도입 전 확인이 필요합니다.
  - Claude Code에서는 `/plugin marketplace add anthropics/skills` 후 `document-skills` 또는 `example-skills` 플러그인으로 설치합니다.
- **실무 활용**: 사내 코드 컨벤션, 리뷰 규칙, 배포 절차를 `SKILL.md` 한 장으로 패키징해 여러 에이전트에 동일하게 적용하는 방식의 레퍼런스로 쓸 수 있습니다.

### 2.3 meta/astryx

- **저장소**: [meta/astryx](https://github.com/meta/astryx) (TypeScript, MIT, 28,839 stars)
- **최근 릴리스**: v0.7.13(11월 10일)부터 v0.7.16(11월 14일)까지 닷새 사이에 네 번의 패치
- **핵심 특징**: 저장소 스스로 "완전히 커스터마이즈 가능하고 에이전트가 바로 쓸 수 있는(agent ready)" 오픈소스 디자인 시스템을 표방합니다. 컴포넌트 API와 문서가 에이전트의 코드 생성 대상으로 소비되는 것을 전제로 설계된 점이 기존 디자인 시스템과 다릅니다.
- **실무 활용**: 디자인 토큰과 컴포넌트를 사람과 에이전트가 같은 계약으로 읽게 만들려는 시도이므로, 사내 디자인 시스템에 에이전트용 메타데이터를 붙이는 작업의 참고 사례가 됩니다.

---

## 3. Engineering Tip: `experimental_decide`로 생성 전에 라우팅을 판정하기

이번 주 결정 모델 소식은 프론트엔드에 곧바로 쓸 수 있는 패턴을 하나 제공합니다. 채팅 요청마다 비싼 생성 모델을 먼저 호출하는 대신, 값싼 결정 모델로 의도와 도구 필요 여부를 먼저 판정하고 분기하는 구조입니다. Vercel AI SDK는 이 계층을 `experimental_decide`로 노출합니다.

```typescript
// app/api/assistant/route.ts
import { google } from '@ai-sdk/google';
import { experimental_decide } from 'ai';

export async function decideRoute(question: string, pageUrl: string) {
  const { answers, usage } = await experimental_decide({
    model: google.decisionModel('gemini-decision-1'),
    state: { question, page: pageUrl },
    questions: {
      needsDocs: {
        type: 'boolean',
        instructions: '이 질문에 답하려면 사내 문서 검색이 필요한가?',
        criteria: {
          true: '문서에만 있는 최신 정보가 필요하다',
          false: '일반 지식만으로 답할 수 있다',
        },
      },
      intent: {
        type: 'choice',
        instructions: '요청의 성격을 하나 고르시오.',
        criteria: {
          code: '코드 생성·수정·리뷰',
          explain: '개념 설명',
          smalltalk: '인사나 잡담',
        },
      },
    },
  });

  // boolean 답변은 참일 확률(probability)을 담습니다.
  const docProbability = (answers.needsDocs as { probability: number }).probability;
  const { choice, probabilities } = answers.intent;

  // 0.5~0.7 구간은 어느 쪽도 확신이 아니므로 생성으로 넘기지 않고 되묻습니다.
  if (docProbability > 0.5 && docProbability < 0.7) {
    return { action: 'clarify' as const, usage };
  }

  return {
    action: docProbability >= 0.7 ? ('retrieve' as const) : ('direct' as const),
    intent: choice,
    intentConfidence: probabilities?.[choice] ?? null,
    usage,
  };
}
```

이 판정 결과를 받아 `retrieve`일 때만 검색 도구를 붙이고, `direct`일 때는 생성 모델을 바로 호출하면 됩니다. 판정 자체는 입력 100만 토큰당 0.10달러에 출력 과금이 없고 지연이 150~250ms 수준이라, 전체 생성을 한 번 아끼는 것만으로 비용이 상쇄됩니다.

### 도입 전에 확인할 세 가지

1. **임계값은 보정해서 씁니다.** 확률은 모델이 학습한 분포일 뿐 정답 보장이 아닙니다. 자체 라벨 데이터로 Brier score와 구간별 정확도를 확인하고, 애매한 구간은 사람 검토나 되묻기로 돌리는 편이 안전합니다.
2. **확률의 정의가 provider마다 다릅니다.** Gemini Decisions API 문서 기준 `noul` 확률은 0.01~0.99 사이로만 반환되므로 "0.99 초과" 조건은 성립하지 않습니다. `choice`는 해당 선택지가 없어도 확률을 선택지들에 분배하므로, 범위 밖 입력은 별도 `noul` 질문으로 걸러야 합니다. Anthropic 어댑터는 구조화 출력을 쓰기 때문에 `choice`·`score`에 확률 분포가 없고 `boolean`도 프롬프트로 추정한 P(true)입니다. 게이트를 다른 provider로 옮길 때 임계값이 그대로 유효하다고 가정해서는 안 됩니다.
3. **실험 API라는 점을 전제로 설계합니다.** `experimental_decide`와 결정 모델 명세는 패치 릴리스에서 바뀔 수 있습니다. 판정 호출을 별도 모듈로 분리하고, 실패 시 생성 모델 단독 경로로 폴백하는 구조를 처음부터 넣어 두는 편이 좋습니다.

---

## 4. 마치며 & 다음 주 관전 포인트

이번 주의 공통된 방향은 "판정과 생성을 분리하는 것"이었습니다. Gemini Decision 1, LangChain의 `BaseDecisionModel`, AI SDK의 `experimental_decide`가 모두 같은 모양(질문 맵 + 확률 + 신뢰도)으로 수렴했고, 프론티어 모델들은 더 비싼 모델을 항상 쓰지 않도록 Carbon·Hydrogen, Fable·Opus 같은 계층 구조와 동적 라우팅(Orchestrator)을 제품 기본값으로 밀고 있습니다. 프론트엔드에서도 채팅 UI를 만드는 일보다, 어떤 요청을 어떤 모델·도구로 보낼지 결정하는 계층을 설계하는 일이 비중을 늘리고 있습니다.

지난 리포트에서 예고한 WebContainer와 로컬 웹 에이전트 결합 아키텍처는 분량 관계로 다음 주로 넘겼습니다. 대신 이번 주 트렌딩에서 확인된 것처럼 에이전트가 브라우저를 직접 다루는 도구 계층(agent-browser)이 빠르게 자리 잡고 있으므로, 다음 주에는 그 도구 계층과 로컬 개발 환경을 잇는 구성과, 이번 주에 나온 MCP 서버 보안 이슈의 실무 대응을 함께 다루겠습니다. 궁금한 점이나 다뤄줬으면 하는 라이브러리가 있다면 댓글로 의견 남겨주세요!
