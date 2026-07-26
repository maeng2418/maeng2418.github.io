// SPEC-MAENGV2-EDITOR-MERGE-006 design.md §B D9 — 빌드 타임 상수.
// next.config.ts의 env 인라인(MAENG_BUILD_TARGET)을 컴파일 시점 리터럴로 참조한다.
// 정적 빌드에서는 이 값이 리터럴 false가 되어 IS_SERVER_TARGET에 의존하는
// 코드 경로(수정 진입점 등)가 번들·산출물에서 dead-code로 제거된다(REQ-EDIT-002).
// @MX:ANCHOR: [AUTO] 정적/서버 빌드 타깃 분기의 단일 진실 공급원 — 여러 컴포넌트가 참조한다
// @MX:REASON: 이 상수가 어긋나면 정적 산출물에 서버 전용 요소가 누출되거나 서버 타깃에서 진입점이 누락된다
export const IS_SERVER_TARGET = process.env.MAENG_BUILD_TARGET === 'server'
