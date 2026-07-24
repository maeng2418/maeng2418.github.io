// Server Action 공용 결과 타입 — 에러를 식별 가능한 메시지로 표면화한다 (§C: silent failure 금지)
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

export function actionError(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : String(error) }
}
