---
title: '[AI News] 2026년 11월 4주차 AI 트렌드 리포트: GPT-6.2 Astra·Sol과 Gemini 4 Neon, 그리고 승인이 서명이 된 주'
date: 2026-11-23 09:00:00
category: 'AI News'
thumbnail: '../../images/ai-news-2026-11-w4.png'
draft: false
---

지난 7일(2026년 11월 16일~23일) 사이 프론트엔드와 AI 엔지니어링 생태계에는 두 가지 흐름이 뚜렷했습니다. 하나는 각 사가 가장 비싼 모델이 아니라 가장 자주 호출되는 중간 티어의 세대를 갈아 끼운 것이고, 다른 하나는 에이전트가 사람의 승인을 받는 경계를 서명과 만료로 고정한 것입니다. 이번 글에서는 OpenAI GPT-6.2 Astra·Sol, Google Gemini 4 Neon, 음성 모델 GPT-Live-1.1과 Live API, Vercel AI SDK 7.0.174~179, MCP 참조 서버 보안 릴리스, 그리고 이번 주 GitHub에서 급상승한 에이전트 UI 프로젝트 세 곳을 정리했습니다. 본문의 날짜는 각 사가 공개한 발표 일자 기준입니다.

> 💡 **이번 주 핵심 요약 (3줄 요약)**
>
> 1. **중간 티어 모델의 세대 교체**: 11월 17일 OpenAI가 GPT-6.2 Astra와 GPT-6.2 Sol을 공개했습니다. Astra는 100만 토큰당 입력 8달러·캐시 입력 0.40달러·출력 40달러로 GPT-6 Astra보다 20% 저렴하고, Sol은 GPT-6.1 Sol과 같은 2달러·0.10달러·10달러를 유지합니다. 11월 18일 Google은 Gemini 4 Neon을 3달러·0.15달러·15달러에 내놓았고, Artificial Analysis 지능지수에서 Astra 62, Neon 61, Sol 57로 선두권을 다시 채웠습니다.
> 2. **음성 에이전트의 표준화**: 11월 19일 GPT-Live-1.1이 `/v1/live/sessions` API에 공개되었습니다. WebRTC 세션은 5~60초 무음 뒤 추론을 멈추고 분당 0.02달러로 대기하며, AI SDK 7.0.179와 Google GenAI SDK 3.5.0이 각각 WebSocket·WebRTC Live 연결을 정식으로 열었습니다.
> 3. **승인 경계의 서명화**: AI SDK 7.0.178이 자동 거부된 도구 호출의 승인 요청까지 서명하던 결함을 고쳤고, AG-UI는 승인 토큰에 HMAC 서명과 만료를 붙였습니다. MCP 참조 서버는 지난주에 이어 2주 연속 보안 릴리스(v2.5.0, 취약점 8건)를 냈습니다.

---

## 1. This Week in Releases (주요 릴리스 소식)

### 1.1 OpenAI GPT-6.2 Astra·Sol: 더 싸진 프론티어와 토큰 효율 (11월 17일)

OpenAI가 11월 17일 GPT-6.2 Astra와 GPT-6.2 Sol을 공개했습니다. Astra는 가장 어려운 작업용 프론티어 모델이고, Sol은 일상 업무용 경량 모델입니다. 두 모델 모두 같은 작업을 더 적은 출력 토큰으로 끝내는 것을 전면에 내세웠습니다.

- **가격**: API 기준 100만 토큰당 Astra가 입력 8달러, 캐시 입력 0.40달러, 출력 40달러입니다. GPT-6 Astra의 10달러·1달러·50달러에서 입력과 출력은 20%, 캐시 입력은 60% 내렸습니다. Sol은 GPT-6.1 Sol과 같은 2달러·0.10달러·10달러를 유지합니다. 모델 ID는 `gpt-6.2-astra`와 `gpt-6.2-sol`입니다.
- **제공 범위**: ChatGPT Work와 Codex에서 Plus·Pro·Enterprise·Edu 사용자가 바로 쓸 수 있습니다. Pro 500 구독자는 두 모델 모두 Ultrafast로 쓸 수 있고, Pro 200 구독자에게도 Sol부터 Ultrafast가 열립니다.
- **벤더가 밝힌 성과**: 다단계 전문 업무를 평가하는 Agents' Last Exam에서 GPT-6 Astra보다 5.2점 높은 점수를 3분의 1 미만 비용으로 냈고, Claude Fable 5.2보다는 5.5점 앞서면서 비용은 5% 수준이라고 밝혔습니다. Terminal-Bench-Science 0.1에서는 9점, 내부 GDPval v2에서는 6.2점(출력 토큰 22% 감소) 올랐습니다. Sol은 FrontierCode 2.0에서 Astra와 0.5점 차이를 약 5분의 1 비용으로 냈다고 합니다.
- **독립 평가**: Artificial Analysis 지능지수에서 Astra는 62로 2위(Claude Fable 5.2가 65), Sol은 57로 GPT-6 Astra와 동급이면서 과제당 비용은 약 15% 수준입니다. AA-3D에서는 Astra가 1318로 1위(Fable 5.2 1271, Sol 1259)였습니다. 반면 코딩 에이전트 지수(Codex 하네스, 최대 노력)에서는 Astra가 GPT-6 Astra와 같은 점수였고 Sol은 3점 내려갔으며, 그 원인은 SWE-Atlas-QnA-AA에서 14점이 빠진 데 있었습니다.
- **반응**: 출시 직후 파워 유저 반응은 갈렸습니다. VentureBeat는 "거의 쓸 수 없다"는 제목으로 부정적 반응을 전했고, Artificial Analysis의 AA-Omniscience 기준 환각률은 최대 노력에서 Astra 59%, Sol 55%로 측정되었습니다. 벤더 수치와 독립 수치가 갈리는 전형적인 사례입니다.
- **SDK 반영**: `openai-node` v7.58.0(11월 17일)에 `gpt-6.2-astra`, `gpt-6.2-sol`과 법무용 구성인 "GPT-6.2 Astra Law"(Responses) 식별자가 추가되었고, `@ai-sdk/openai` 3.0.145(11월 22일)도 두 모델을 지원합니다.

실무에서 먼저 볼 지점은 가격표보다 캐시 정책입니다. OpenAI는 캐시 재사용을 위해 프롬프트 접두사를 바꾸지 말고 새 지시를 뒤에 덧붙이라고 권고했습니다. 시스템 프롬프트와 도구 정의를 앞쪽에 고정하고 사용자 입력·턴별 지시를 뒤로 미루는 구조가 그대로 비용 차이로 이어집니다.

### 1.2 Google Gemini 4 Neon: Carbon과 Hydrogen 사이 (11월 18일)

Google DeepMind가 11월 18일 Gemini 4 Neon을 공개했습니다. Carbon이 가장 어려운 장기 과제, Hydrogen이 빠른 일상 실행을 맡는 가운데, Neon은 그 사이의 고빈도·중난도 작업을 겨냥한 모델입니다.

- **가격과 스펙**: 100만 토큰당 입력 3달러, 캐시 입력 0.15달러(95% 할인), 출력 15달러이고 컨텍스트는 100만 토큰입니다. 사고 수준은 Low부터 Extra High까지 네 단계이며, Carbon 대비 토큰 단가가 25% 낮습니다.
- **벤더가 밝힌 성과**: 기본 High 사고 수준에서 Carbon보다 과제당 비용이 32% 낮고, Extra High에서는 경쟁 모델의 최고 설정보다 36% 이상 저렴하다고 합니다. Artificial Analysis Coding Agent Index 1위(58.6), Terminal-Bench 4.1 65.2%, FrontierCode 2.0 46.2%(기본 High), Vals Index 2위(70.9%), Zapier AutomationBench 1위(56.3%), Andon Labs Vending-Bench 2 1위(16,843달러), Arena의 Agent Arena Index 2위(1336)를 기록했습니다.
- **독립 평가**: Artificial Analysis 지능지수에서 Extra High가 61로 3위이며, High에서는 Carbon(High)과 같은 점수를 절반 이하의 과제당 비용으로 냅니다. 과제당 6.44달러로 Carbon의 7.76달러(할인 전 단가 기준)보다 약 17% 저렴하고, 과제당 시간은 약 21분으로 Carbon의 약 36분보다 40% 짧습니다. 출력 토큰은 15% 더 쓰지만 단가가 낮고 출력 속도가 약 110토큰/초로 Carbon의 약 57토큰/초보다 빨라 총비용과 시간이 모두 줄었습니다.
- **안전·정렬**: Terminal-Bench 4.0에서 거부율 1.98%, Terminal-Bench-Science에서는 0%였고, 코딩 치팅 평가의 지름길 사용률은 2.45%로 Gemini 4 계열 최저라고 밝혔습니다. 에이전트 안전 스위트의 오정렬 행동률은 0.09%, 정직성 평가 통과율은 99.2%입니다.
- **제공 범위**: 유료 Gemini API(Google AI Studio, Android Studio), Gemini 앱의 AI Pro·Ultra 구독자, Antigravity 데스크톱·CLI·IDE 확장, Gemini for business에서 쓸 수 있습니다. 사이버 방어용 구성은 Fairwind 프로그램 참여자를 대상으로 순차 제공됩니다.
- **SDK 반영**: `@ai-sdk/google`이 11월 20일 `gemini-4-neon` 모델 ID와 `xhigh` 사고 수준을 추가했고, `@langchain/google` 0.2.16(11월 18일)도 같은 프로필과 `xhigh`를 지원합니다.

Gemini 4 계열은 이제 Orchestrator가 Neon과 Hydrogen을 오가며 계획과 실행을 나누는 구성을 전제로 합니다. 프론트엔드 입장에서는 모델 선택이 "가장 좋은 모델 하나"가 아니라 "이 요청을 어느 사고 수준으로 보낼 것인가"라는 파라미터 문제가 되고 있습니다.

### 1.3 GPT-Live-1.1과 Live API: 음성 세션의 대기 요금 (11월 19일)

OpenAI가 11월 19일 GPT-Live-1.1을 API에 공개했습니다. GPT-Live-1.1은 듣기와 말하기를 동시에 처리하는 풀듀플렉스 음성 모델로, ChatGPT Plus·Pro의 음성 대화를 10월 15일부터 구동해 온 모델입니다.

- **엔드포인트**: `v1/live/sessions` 전용입니다. Chat Completions, Responses, 기존 Realtime API(`v1/realtime`)에서는 쓸 수 없고, WebRTC(권장)·WebSocket·SIP 전송을 지원합니다.
- **가격**: 활성 분당 0.05달러, 대기(standby) 분당 0.02달러입니다. 추론과 도구 호출은 연결된 백엔드 모델 요금으로 별도 과금됩니다.
- **대기 모드**: WebRTC 세션에서 `session.wake_policy.type`을 `speech`로 두고 `session.idle_timeout_s`를 5~60초로 설정하면, 입력·출력 전사가 그 시간 동안 없을 때 추론을 멈추고 대기 요금으로 전환합니다. `session.paused`와 `session.resumed` 이벤트로 상태를 알 수 있고, 대기 중에도 마이크 트랙은 살아 있어야 깨어납니다. 대기 후 첫 응답은 추론을 다시 시작하느라 조금 느려질 수 있습니다.
- **세션 규칙**: 모델과 음성은 세션 중에 바꿀 수 없고, 시스템 지시는 최대 16,384토큰에 `session.instructions.append`로 500토큰씩 덧붙일 수 있습니다. 복잡한 추론은 `delegation.type`으로 `responses`나 `client` 모드를 골라 백엔드 모델에 넘깁니다.
- **SDK 반영**: `openai-node` v7.61.0(11월 19일)이 `gpt-live-1.1`을, v7.62.0(11월 20일)이 Live WebRTC 대기 설정을 추가했습니다. AI SDK 7.0.179는 `gateway.experimental_realtime()`이 `openai/gpt-live-1`·`gpt-live-1.1`을 Gateway Live 경로로 연결하도록 했고, 단명 토큰으로 브라우저가 제공자와 직접 WebSocket을 열 수 있는 `client-secret-websocket` 연결을 지원합니다. Google GenAI JS SDK 3.5.0(11월 18일)도 Live Interactions의 WebSocket·WebRTC 지원과 인증 토큰 클라이언트를 공개 SDK에 넣었습니다.

프론트엔드에서 이 변화가 중요한 이유는 연결 구조입니다. 이전에는 서버가 WebSocket을 중계해야 했지만, 이제 단명 토큰을 받아 브라우저가 직접 연결할 수 있습니다. 대신 토큰 발급과 만료, 그리고 대기 상태를 UI에 표시하는 일이 새로 생깁니다. 사용자가 말을 멈춘 동안 화면이 "연결 끊김"으로 보이지 않게 하려면 `session.paused`를 별도 상태로 다뤄야 합니다.

### 1.4 Vercel AI SDK 7.0.174 ~ 7.0.179: 승인 서명과 스트림 안정성 (11월 20일)

이번 주 AI SDK 패치는 새 기능보다 채팅 UI와 에이전트 루프의 경계 조건을 다듬는 데 집중했습니다.

- **UI 메시지 검증의 메모리 폭주 방지 (7.0.174)**: `validateUIMessages`·`safeValidateUIMessages`·에이전트 UI 스트림 헬퍼가 `providerMetadata`, `callProviderMetadata`, `resultProviderMetadata`, `toolMetadata`, 인용 메타데이터의 깊게 중첩된 JSON을 재귀 유니온 스키마로 검증했습니다. 값의 몇 배에 달하는 메모리를 써서, 유효한 요청 하나로 워커 메모리를 고갈시킬 수 있었습니다. 이제 한 번의 패스로 검증하고 `__proto__` 제거 외에는 복사하지 않습니다.
- **steering 중단 (7.0.177)**: 아직 출력을 내지 않은 모델 호출을 steer로 취소할 수 있는 interrupt 옵션이 추가되었습니다. 같은 릴리스에서 AI SDK 스킬 문서가 패키지 안 `skills/ai-sdk`로 배포되기 시작했습니다.
- **도구 승인 서명 결함 수정 (7.0.178)**: `experimental_toolApprovalSecret`을 설정해도, 승인 정책이 자동으로 거부한 도구 호출의 승인 요청에는 서명이 붙었습니다. 메시지 기록을 조작할 수 있는 클라이언트가 그 요청을 "승인"으로 되돌려 보내면 거부된 도구가 실행될 수 있었습니다. 이제 자동 거부 요청은 서명하지 않아 이런 응답이 `AI_InvalidToolApprovalSignatureError`로 거부됩니다. 이전 버전이 발급한 자동 거부 서명은 계속 유효하므로, 무효화하려면 시크릿을 교체해야 합니다.
- **prepareStep 메시지 격리 (7.0.178)**: `prepareStep`이 같은 메시지 배열을 여러 스텝에 돌려줄 때 도구 승인 함수가 어느 응답의 호출인지 구분하지 못하던 문제를 고쳐, 스텝마다 메시지 배열을 복사합니다.
- **정책 평가 누적 (7.0.178)**: `@ai-sdk/policy-opa`의 `opaPolicy`가 한 응답의 도구 호출을 각각 이전 대화만 보고 평가해, "한 응답에서 삭제는 한 번" 같은 규칙을 여러 호출이 함께 넘을 수 있었습니다. 이제 같은 응답의 앞선 호출을 메시지에 덧붙여 다시 평가하고 더 제한적인 결정을 따릅니다.
- **Gateway Live 지원 (7.0.179)**: 앞서 본 `gateway.experimental_realtime()`의 Live 모델 연결과 Live 전용 클라이언트 시크릿 발급이 추가되었습니다.

### 1.5 보안·마이그레이션: MCP 참조 서버 v2.5.0과 LangChain Core 1.5.0

**modelcontextprotocol/servers v2.5.0 (11월 18일)**

지난주 v2.4.0에 이어 2주 연속 보안 릴리스입니다. 이번에는 서버 세 곳에서 취약점 8건을 고쳤고, `mcp-server-git` 2026.11.18, `@modelcontextprotocol/server-filesystem` 2.4.0, `@modelcontextprotocol/server-everything` 2.3.1로 올리라고 안내합니다.

- **`mcp-server-git`**: `git_merge` 성공 뒤 Git의 자동 유지보수(`git maintenance run --auto`)가 저장소의 `gc.recentObjectsHook`에 적힌 명령을 서버 권한으로 실행하던 경로를 막았습니다(`maintenance.auto=false`, `gc.auto=0`). 저장소 설정이 promisor remote와 `remote.<name>.uploadpack`·`core.sshCommand`를 선언해 읽기 전용 도구가 객체를 가져오며 임의 프로그램을 실행하던 경로도 `GIT_NO_LAZY_FETCH=1`로 닫았습니다. merge·checkout이 작업 트리에 파일을 쓴 뒤 설정에 포함된 드라이버를 다시 읽도록 바꿨지만, `--repository` 격리 검사를 그 뒤에 다시 하지는 않습니다(#5599).
- **`server-filesystem`**: Linux·macOS에서 `list_directory`, `directory_tree`, `search_files`가 검사한 디렉터리를 그 자리에서 나열하도록 바꿔, 검사와 나열 사이에 심볼릭 링크로 바뀌어 허용 범위 밖 이름이 새는 문제를 막았습니다. Windows에서는 아직 고정되지 않았습니다(#5600).
- **`server-everything`**: NAT64 주소(`64:ff9b::/96`)를 공인 주소로 읽던 사설 주소 가드를 고쳐, NAT64 게이트웨이가 있는 네트워크에서 사설 IPv4로 우회하던 경로를 막았습니다.
- **그 밖에**: 모든 참조 서버가 Streamable HTTP를 제공하고, `server-memory`는 종료 시 잠금 파일을 풀고 그래프 크기에 선택적 쓰기 제한을 둡니다. TypeScript 서버가 날짜 버전에서 시맨틱 버전으로 옮긴 탓에 패키지 관리자가 2.4.0을 이전 날짜 버전보다 낮게 판단하므로, 버전을 명시해 설치해야 합니다.

**LangChain Core 1.5.0 (11월 20일)**

`@langchain/core` 1.5.0은 종료 이유(finish reason)를 정규화하는데, 이번에는 호환성이 깨집니다. `FinishReason` 타입이 `stop | length | tool_use | content_filter`에서 `stop | length | tool_call | content_filter | refusal | context_exceeded | error | other`로 바뀌고 `tool_use`는 `tool_call`이 됩니다. 스트리밍 메시지의 `response_metadata.finish_reason`은 정규화 값이 아니라 제공자의 원본 값을 담고, `MessageFinishEvent.reason`은 폐기 예정이지만 이전 값으로 계속 방출됩니다. Anthropic 통합은 `pause_turn`을 `finish_state: "suspended"`로 표시합니다. UI에서 "완료·중단·거부"를 구분해 렌더링한다면 이번 주에 매핑표를 다시 확인해야 합니다.

같은 주 `langchain` 1.6.7은 `humanInTheLoopMiddleware`가 만드는 `reject`·`respond` 도구 메시지에 `lc_source: "hitl_interrupt_decision"`과 결정값을 붙였고, `@langchain/google` 0.2.16은 Gemini Decisions API용 `GoogleClassifier`를 실험적으로 추가했습니다. 지난주 다룬 결정 모델 계층이 Google 프로바이더에도 들어온 셈입니다.

---

## 2. Trending Open Source & Frameworks (주목할 오픈소스 및 프레임워크)

GitHub 주간 트렌딩(2026년 11월 23일 집계)에서 이번 주 가장 빠르게 성장한 저장소 중, 에이전트와 사용자가 만나는 지점을 각각 다른 층에서 푸는 세 곳을 골랐습니다. 프로토콜(AG-UI), 렌더링(A2UI), 검토 화면(Plannotator)입니다.

### 2.1 ag-ui-protocol/ag-ui: 에이전트와 앱을 잇는 이벤트 프로토콜 (이번 주 +3,620 stars)

- **저장소**: [ag-ui-protocol/ag-ui](https://github.com/ag-ui-protocol/ag-ui) (TypeScript, MIT, 21,183 stars)
- **최근 릴리스**: `release/2026-11-17`, `release/2026-11-21`
- **핵심 특징**:
  - 요청·응답 모델에 맞지 않는 에이전트의 동작(토큰 스트리밍, 응답 중 도구 호출, 공유 상태 갱신, 사람의 개입, 서브에이전트 생성)을 하나의 양방향 이벤트 스트림으로 표준화합니다. 에이전트는 타입이 있는 이벤트를 내보내고, 클라이언트는 프레임워크와 무관하게 그 이벤트를 렌더링합니다.
  - 1.0 명세는 JSON Schema로 고정되어 있고 TypeScript·Python·.NET SDK가 그 명세에서 생성됩니다. 0.x 에이전트와 1.0 클라이언트가 서로 호환됩니다. LangChain, CrewAI, Mastra, Google ADK, Microsoft Agent Framework, Pydantic AI 어댑터를 제공하며 MCP(도구), A2A(에이전트)와 역할이 겹치지 않게 나뉩니다.
  - 11월 17일 `@ag-ui/client` 1.0.5는 겹치는 스트림에서 메시지 순서와 스냅샷 경계가 뒤섞여 병렬 도구 호출이 바뀌던 문제를 고쳤고, 추론 델타를 텍스트처럼 압축해 저장 기록을 줄였습니다. 11월 21일에는 `ag-ui-openai-agents` 0.2.0이 승인 토큰에 HMAC 서명과 만료를 붙였고, `ag_ui_adk` 0.14.0이 `/agents/state`·`/capabilities`에서 인증을 우회하던 문제(GHSA-jhvp-j8pf-5vh5)를 막았습니다.
- **실무 활용**: React 앱에서 에이전트의 상태·도구 호출·중단·승인을 자체 이벤트 규약으로 직접 만들고 있다면, 그 규약을 AG-UI 이벤트로 바꾸는 것만으로 서버 프레임워크 교체 비용이 줄어듭니다. `npx create-ag-ui-app@latest`가 CopilotKit 기반 Next.js 클라이언트나 터미널 클라이언트를 스캐폴딩합니다.

### 2.2 a2ui-project/a2ui: UI를 코드가 아닌 데이터로 스트리밍 (이번 주 +640 stars)

- **저장소**: [a2ui-project/a2ui](https://github.com/a2ui-project/a2ui) (TypeScript, Apache-2.0, 18,128 stars)
- **최근 릴리스**: Swift `v0.11.0+swift`, Python `a2ui-core` 0.7.0, `a2ui-agent-sdk` 0.12.0, `cli-v0.4.0` (모두 11월 17일)
- **핵심 특징**:
  - 에이전트가 HTML이나 실행 코드를 보내는 대신, 검증된 데이터로 UI를 기술하고 앱이 네이티브 컴포넌트로 렌더링합니다. React, Angular, Lit, Flutter, SwiftUI, Jetpack Compose 어댑터를 제공하며 WebView가 필요 없습니다.
  - 구조는 추론(에이전트가 A2UI 스킬로 UI 서술 생성), 전송(에이전트 SDK가 검증·매크로 확장 후 A2UI Transport 메시지로 변환), 렌더링(`@a2ui/web_core`와 `@a2ui/react` 같은 어댑터, 카탈로그)의 세 층입니다.
  - 카탈로그가 에이전트가 조립할 수 있는 컴포넌트를 제한하고, 입력·출력을 스키마로 검증해 신뢰 경계 밖의 에이전트가 임의 코드를 실행하지 못하게 합니다. 결제·PII처럼 에이전트에 맡기면 안 되는 데이터를 다루는 화면에 특히 맞습니다.
  - 11월 17일 릴리스는 스키마 검증을 강화하는 호환성 깨짐을 포함합니다. 객체 수준(`anyOf`, `additionalProperties: false`)과 배열 수준(`minItems`, `maxItems`, `prefixItems`) 제약을 동적 바인딩 인자에 강제하고, 선언되지 않은 함수 인자를 거부하며, `openUrl.url`에 스킴이 붙은 URI를 요구합니다.
- **실무 활용**: "에이전트가 화면을 직접 만들게 한다"는 요구가 있을 때, 자유 형식 코드 생성과 카탈로그 기반 조립 중 후자를 택하는 근거가 됩니다. 기능이 없는 컴포넌트를 에이전트가 지어내는 대신 카탈로그 안에서만 고르게 됩니다.

### 2.3 backnotprop/plannotator: 에이전트 작업을 검토하는 로컬 화면 (이번 주 +2,815 stars)

- **저장소**: [backnotprop/plannotator](https://github.com/backnotprop/plannotator) (TypeScript, Apache-2.0, 14,422 stars)
- **최근 릴리스**: v0.28.66(11월 16일)부터 v0.29.2(11월 22일)까지 다섯 번. v0.29.0에서 코드 리뷰 창이 파일 트리·이미지 diff·미니맵을 갖춘 두 패널 구조로 바뀌었고, v0.29.2는 107개 PR(외부 기여자 25명, 그중 16명이 첫 기여)을 담았습니다.
- **핵심 특징**:
  - Claude Code, Codex, Copilot CLI, Gemini CLI, OpenCode, Kiro, Droid, Amp, Pi 같은 코딩 에이전트에 플러그인·훅·명령으로 붙는 로컬 브라우저 리뷰 화면입니다. 계획·명세·마크다운·HTML·PR diff에 주석을 달아 그대로 에이전트에 돌려줍니다.
  - v0.29.2의 실행 카드는 승인 UI의 좋은 레퍼런스입니다. 에이전트가 명령을 메시지에 넣으면 카드가 명령 원문, 실행 위치("On your Mac · in ~/projects/x"), Run 버튼 하나를 보여주고, 실행하면 출력이 카드 안에 스트리밍되며 Stop·종료 코드·소요 시간이 함께 표시됩니다. 숨김 문자나 방향 제어 문자가 섞인 명령은 실행·복사가 거부되고 이유를 밝힙니다.
  - 비밀값 요청도 같은 원칙입니다. 비밀 입력 상자에 넣은 값은 macOS 키체인, Linux Secret Service, Windows DPAPI 또는 소유자 전용 파일에 보관되고, 에이전트는 이름만 받습니다. Run과 Save는 사람만 누를 수 있고 에이전트의 도구 호출로는 누를 수 없습니다.
- **실무 활용**: 승인 카드에서 무엇을 보여줘야 하는지(정확한 명령, 실행 위치, 중단 수단, 결과의 종료 코드)와 비밀값을 어떻게 건네지 않는지(존재만 알리고 값은 사람이 입력)를 참고할 수 있습니다. 라이브러리가 아니라 앱이므로 설계 사례로 읽는 편이 맞습니다.

참고로 [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)(58,836 stars, 이번 주 +2,268)도 계속 트렌딩 중입니다. 다만 최신 릴리스 v1.13.0은 11월 11일이라 이번 주 릴리스는 아닙니다.

---

## 3. Frontend + AI Engineering Tip: 승인 카드는 UI가 아니라 서명으로 고정하기

이번 주 AI SDK 7.0.178의 도구 승인 서명 수정과 AG-UI의 HMAC 승인 토큰은 같은 문제를 가리킵니다. 표준 `useChat` 패턴에서 서버는 클라이언트가 보낸 메시지 기록으로 대화를 다시 구성하므로, 승인도 클라이언트가 조작할 수 있는 입력입니다. 승인 카드를 예쁘게 그리는 것만으로는 사람이 개입했다는 사실이 보장되지 않습니다.

AI SDK 7은 도구 승인을 호출 단위 정책(`toolApproval`)으로 다루고, 승인 요청을 HMAC으로 서명하는 `experimental_toolApprovalSecret`을 제공합니다. 아래는 결제 도구를 예로 든 서버 라우트입니다.

```typescript
// app/api/agent/route.ts
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  tool,
  type UIMessage,
} from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const user = await getSessionUser(req);

  const result = streamText({
    model: 'openai/gpt-6.2-sol',
    messages: await convertToModelMessages(messages),
    tools: {
      transfer: tool({
        description: '송금을 실행합니다.',
        inputSchema: z.object({
          amount: z.number(),
          recipient: z.string(),
        }),
        execute: async ({ amount, recipient }) => transfer({ amount, recipient }),
      }),
    },
    // 도구가 아니라 호출 단위로 승인 정책을 정합니다.
    toolApproval: {
      transfer: async ({ amount }) => {
        if (user.role !== 'admin') {
          return { type: 'denied', reason: '관리자만 송금할 수 있습니다.' };
        }
        // 1,000 이상은 사람이 직접 승인해야 합니다.
        return amount > 1000 ? 'user-approval' : undefined;
      },
    },
    // 승인 요청을 발급한 서버가 맞는지 검증할 수 있게 서명합니다.
    experimental_toolApprovalSecret: process.env.TOOL_APPROVAL_SECRET,
    instructions:
      '도구 실행이 승인되지 않으면 같은 작업을 다시 시도하지 말고, 거부 사유를 사용자에게 설명하세요.',
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
```

클라이언트는 `approval-requested` 상태의 파트마다 카드를 하나씩 그리고, 자동 승인·자동 거부는 카드 대신 상태 표시로 처리합니다.

```tsx
'use client';

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from 'ai';

export function ApprovalCards() {
  const { messages, addToolApprovalResponse } = useChat({
    transport: new DefaultChatTransport({ api: '/api/agent' }),
    // 모든 승인 응답이 모이면 자동으로 다음 턴을 보냅니다.
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  return messages.flatMap(message =>
    message.parts.map(part => {
      if (part.type !== 'tool-transfer') return null;

      // 한 응답에 도구 호출이 여러 개면 파트도 여러 개입니다.
      // 메시지 단위 버튼 하나로 묶지 말고 toolCallId별로 그립니다.
      switch (part.state) {
        case 'approval-requested':
          // 자동 승인·자동 거부는 addToolApprovalResponse를 호출하지 않습니다.
          if (part.approval.isAutomatic) {
            return <p key={part.toolCallId}>정책에 따라 자동 처리되었습니다.</p>;
          }
          return (
            <div key={part.toolCallId}>
              <p>
                {part.input.recipient}님에게 {part.input.amount}원을 보낼까요?
              </p>
              {part.approval.requestReason && <p>{part.approval.requestReason}</p>}
              <button
                onClick={() =>
                  addToolApprovalResponse({ id: part.approval.id, approved: true })
                }
              >
                승인
              </button>
              <button
                onClick={() =>
                  addToolApprovalResponse({ id: part.approval.id, approved: false })
                }
              >
                거부
              </button>
            </div>
          );
        case 'approval-responded':
          return <p key={part.toolCallId}>결정이 전송되었습니다.</p>;
        case 'output-available':
          return <p key={part.toolCallId}>송금이 완료되었습니다.</p>;
        case 'output-denied':
          return <p key={part.toolCallId}>송금이 거부되었습니다.</p>;
        default:
          return null;
      }
    }),
  );
}
```

### 적용 전에 확인할 네 가지

1. **자동 거부는 서명되지 않습니다.** 7.0.178부터 정책이 자동 거부한 호출의 승인 요청에는 서명이 붙지 않으므로, 그 요청을 승인으로 되돌려 보내면 `AI_InvalidToolApprovalSignatureError`로 거부됩니다. 다만 이전 버전이 발급한 자동 거부 서명은 계속 유효하므로, 이미 배포한 서비스라면 시크릿을 교체해 무효화해야 합니다. 교체하면 아직 대기 중인 승인은 다시 요청해야 합니다.
2. **승인 객체를 클라이언트에서 재조립하지 않습니다.** 서명은 승인 ID, 도구 호출 ID, 도구 이름, 입력값에 묶입니다. UI 상태를 저장했다가 필드를 다시 만들어 보내면 서명 검증이 실패합니다. 서버가 준 파트를 그대로 되돌려야 합니다.
3. **승인 단위는 메시지가 아니라 도구 호출입니다.** 정책 엔진도 이번 주에 응답 하나에 담긴 여러 호출을 누적 평가하도록 바뀌었습니다(`@ai-sdk/policy-opa` 1.0.178). "한 응답에서 삭제 한 번" 같은 예산 규칙을 세웠다면, UI도 호출별 카드로 그려야 서버 정책과 화면이 어긋나지 않습니다.
4. **시크릿은 모든 인스턴스가 공유합니다.** `openssl rand -base64 32`로 32바이트 이상 값을 만들고, 승인을 발급한 인스턴스와 다음 턴에 검증하는 인스턴스가 다를 수 있는 서버리스 환경에서는 같은 값을 모든 인스턴스에 배포해야 합니다.

AG-UI의 `ag-ui-openai-agents` 0.2.0도 같은 방향입니다. 일시 중지된 도구 호출을 스레드·호출 ID·도구 이름·정규화된 인자에 대해 HMAC으로 서명하고, 승인 토큰을 중지시킨 에이전트에 묶고, 소비 시점에 만료를 검사하며, 다중 워커 환경에서는 소비된 토큰 저장소를 공유하도록 요구합니다. 프레임워크가 달라도 도달한 결론은 같습니다. 승인은 화면의 버튼이 아니라, 발급자와 대상과 입력에 묶인 서명이어야 합니다.

---

이번 주의 공통점은 "가장 비싼 모델을 항상 쓰지 않는다"와 "사람의 승인을 추측할 수 없게 만든다"였습니다. 모델 쪽에서는 Astra·Neon·Sol처럼 사고 수준과 단가를 나눠 고빈도 작업을 중간 티어로 내려보내는 구성이 기본값이 되었고, 도구 쪽에서는 승인 요청에 발급자·대상·입력을 묶는 서명이 표준 관행으로 자리 잡고 있습니다. 프론트엔드에서 할 일도 늘었습니다. 어떤 요청을 어느 모델과 사고 수준으로 보낼지 정하고, 승인 카드에서 정확한 명령과 실행 위치와 중단 수단을 보여주고, 대기·중단·거부 상태를 화면에 정직하게 드러내야 합니다.

다음 주에는 이번 주에 남은 두 가지를 이어서 보겠습니다. 하나는 Live API의 단명 토큰으로 브라우저가 직접 연결할 때의 비용과 대기 상태 설계이고, 다른 하나는 MCP 참조 서버에 아직 남은 Windows 나열 고정과 `--repository` 격리 재검사(#5599, #5600)의 진행 상황입니다. 궁금한 점이나 다뤄줬으면 하는 라이브러리가 있다면 댓글로 의견 남겨주세요.
