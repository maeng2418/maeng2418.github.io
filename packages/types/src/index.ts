// 공유 타입 전용 패키지 (런타임 의존성 없음 — plan.md §D.3)
// 실제 도메인 타입은 SPEC ②(maeng-blog)/③(maeng-editor)에서 채워 넣는다.

/** 스캐폴드 placeholder — 빌드 파이프라인 검증용 최소 타입 */
export interface Placeholder {
  readonly _scaffold: true
}
