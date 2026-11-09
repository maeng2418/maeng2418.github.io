---
title: '[AI News] 2026년 11월 2주차 AI 트렌드 리포트: Model Context Protocol(MCP) 생태계 확장과 Vercel AI SDK 최신 에이전트 패턴'
date: 2026-11-09 09:00:00
category: 'AI News'
draft: false
---

지난 7일간 프론트엔드 및 풀스택 엔지니어링 생태계에서 주목받은 Model Context Protocol(MCP) 표준화 동향, Vercel AI SDK 최신 에이전트 제어 패치, 그리고 실무 적용 팁을 정리했습니다.

> 💡 **이번 주 핵심 요약 (3줄 요약)**
>
> 1. **Model Context Protocol(MCP) 생태계 본격 확장**: Anthropic의 MCP TypeScript SDK v2가 공개되며 도구·리소스 프로토콜이 표준화되었고, Cursor와 Claude Code를 중심으로 로컬 개발 툴체인 연동이 가속화되었습니다.
> 2. **Vercel AI SDK 7.0 최신 패치**: 에이전트 실행 흐름을 제어하는 `steering.queue()`와 긴 도구 실행 시 연결 단절을 방지하는 `ping` 스트림 파트가 추가되었습니다.
> 3. **구조화된 출력 패턴의 단일화**: 레거시 `generateObject` 대신 `generateText`의 `Output.object`를 활용해 도구 호출과 타입 안전한 최종 응답을 단일 루프에서 처리하는 설계가 정착되고 있습니다.

---

## 1. This Week in Releases (주요 릴리스 소식)

### 1.1 Model Context Protocol(MCP) TypeScript SDK v2 공개
LLM 애플리케이션과 로컬/원격 도구 간의 컨텍스트 교환을 표준화하는 MCP가 TypeScript SDK v2를 공개했습니다.

- **패키지 분리 및 런타임 중립성**: 기존 단일 패키지에서 `@modelcontextprotocol/server`와 `@modelcontextprotocol/client`로 명확히 분리되었습니다. 루트 엔트리는 브라우저나 Cloudflare Workers 등 런타임 중립적인 환경을 지원하며, 프로세스 기반 `stdio`는 `./stdio` 서브패스를 통해서만 명시적으로 임포트하도록 설계되었습니다.
- **Standard Schema 지원**: Zod v4, Valibot, ArkType 등 최신 검증 라이브러리를 자유롭게 조합할 수 있는 Standard Schema 규격을 채택했습니다.
- **트랜스포트 현대화**: 레거시 HTTP+SSE 방식을 넘어 재연결 복구와 양방향 통신을 지원하는 Streamable HTTP 및 프로세스 자식 실행을 위한 stdio 트랜스포트를 표준으로 제공합니다.

### 1.2 Vercel AI SDK 7.0 최신 패치 (v7.0.155 ~ v7.0.163)
Vercel AI SDK가 에이전트 런타임 안정성과 제어 편의성을 대폭 보강한 패치를 릴리스했습니다.

- **`steering.queue()` 에이전트 큐잉 API**: 모델이 현재 도구 호출 태스크를 끝마치고 최종 답변을 내놓는 시점에 맞춰 다음 사용자/시스템 지침을 주입하는 작업 큐 메커니즘이 도입되었습니다.
- **`ping` 스트리밍 하트비트 파트**: 장시간 실행되는 무거운 도구(DB 마이그레이션, E2E 테스트 실행 등) 호출 시 리버스 프록시나 게이트웨이 타임아웃으로 SSE 스트림이 끊기는 문제를 방지하기 위해 주기적 `ping` 파트가 추가되었습니다.
- **`ModelMessage` 런타임 검증 오버헤드 제거**: 매 스텝마다 누적 대화 기록 전체를 스키마로 검증하던 불필요한 직렬화 병목을 제거하여, 긴 대화 컨텍스트에서의 토큰 첫 응답 속도(TTFT)를 크게 단축했습니다.

---

## 2. Weekly Trending Repo (이번 주 급상승 오픈소스)

### 2.1 modelcontextprotocol/servers (Anthropic)
- **저장소**: [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- **핵심 특징**:
  - Anthropic 공식 오픈소스 프로젝트로, PostgreSQL, SQLite, Git, Filesystem, Fetch, Brave Search 등 실무에서 가장 많이 쓰이는 참조 MCP 서버들을 모아둔 모노레포입니다.
  - 별도의 API 중계 서버를 구축하지 않고도, 로컬 DB나 코드 저장소를 Claude Code, Cursor, Claude Desktop 등에 안전하게 '읽기/쓰기 도구'로 붙일 수 있습니다.

### 2.2 browser-use (Agentic Web Automation)
- **저장소**: [browser-use/browser-use](https://github.com/browser-use/browser-use)
- **핵심 특징**:
  - Playwright 기반으로 브라우저 DOM 트리를 LLM이 읽기 쉬운 접근성 트리(Accessibility Tree)로 변환해 클릭, 스크롤, 폼 입력을 자율 수행합니다.
  - 복잡한 2단계 인증이나 캡차 상황에서는 사용자에게 브라우저 제어권을 넘기는 Human-in-the-loop 패턴을 지원하여 웹 자동화 실무 적용률을 높였습니다.

---

## 3. Engineering Tip: TypeScript로 5분 만에 나만의 MCP Server 만들기

로컬 터미널이나 사내 API를 Cursor나 Claude Code의 에이전트에 도구로 연결하고 싶다면, `@modelcontextprotocol/server`를 사용해 간단히 stdio 서버를 구축할 수 있습니다.

```typescript
// server.ts
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { z } from 'zod';

serveStdio(() => {
  const server = new McpServer({
    name: 'internal-dev-tools',
    version: '1.0.0',
  });

  // 사내 서비스 배포 상태를 조회하는 커스텀 도구 등록
  server.registerTool(
    'get-deploy-status',
    {
      description: '특정 서비스의 최근 배포 상태 및 커밋 해시를 조회합니다.',
      inputSchema: z.object({
        serviceName: z.enum(['web', 'api', 'batch']).describe('조회할 서비스명'),
      }),
    },
    async ({ serviceName }) => {
      // 실제 API 호출 또는 로컬 상태 조회 로직
      const statusInfo = {
        service: serviceName,
        status: 'HEALTHY',
        deployedAt: new Date().toISOString(),
        version: 'v2.4.1',
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(statusInfo, null, 2),
          },
        ],
      };
    }
  );

  return server;
});
```

### 실행 및 에디터 연동 방법
1. `npm install @modelcontextprotocol/server zod` 후 `tsx server.ts`로 빌드 및 실행을 테스트합니다.
2. Claude Desktop (`claude_desktop_config.json`) 또는 Cursor MCP 설정에 다음 한 줄을 추가합니다:
   ```json
   {
     "mcpServers": {
       "my-tools": {
         "command": "node",
         "args": ["/절대경로/server.js"]
       }
     }
   }
   ```
3. 에디터나 터미널의 에이전트가 "현재 웹 배포 상태 확인해줘"라는 질문을 받았을 때 위 `get-deploy-status` 도구를 자율적으로 호출하게 됩니다.

---

## 4. 마치며 & 다음 주 관전 포인트

이번 주는 '프론트엔드와 AI가 단순 채팅 UI를 넘어 도구 표준 프로토콜(MCP)로 연결되는 흐름'이 명확해진 한 주였습니다. 프론트엔드 엔지니어 역시 브라우저 클라이언트뿐만 아니라 로컬 에이전트 환경에 맞춘 경량 도구 인터페이스 설계 역량이 중요해지고 있습니다.

다음 주 11월 3주차 리포트에서는 최근 Next.js 15 환경에서 도입이 활발해진 **클라이언트 사이드 WebContainer와 로컬 웹 에이전트 결합 아키텍처**를 다룰 예정입니다. 함께 살펴보고 싶은 주제가 있다면 댓글로 의견 남겨주세요!
