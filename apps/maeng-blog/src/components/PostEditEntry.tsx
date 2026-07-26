// SPEC-MAENGV2-EDITOR-MERGE-006 design.md §B D9 — 포스트 상세 페이지의 수정 진입점.
// 서버 컴포넌트(클라이언트 JS 0) — 정적 타깃에서는 IS_SERVER_TARGET 분기(build-target.ts)로
// 이 컴포넌트의 import·마크업 자체가 dead-code로 제거된다(REQ-EDIT-002).
// data-editor-edit-entry 속성은 검증용 고정 마커다 — AC-M2-007/008/010이 이 문자열을 grep 대상으로 삼는다.
interface PostEditEntryProps {
  /** {category}/{fileName} — PostMeta.slug 와 동일한 값 (design.md §B D9 딥링크 계약) */
  path: string
}

export function PostEditEntry({ path }: PostEditEntryProps) {
  return (
    <a
      data-editor-edit-entry
      href={`/editor?path=${encodeURIComponent(path)}`}
      className="text-xs font-semibold text-ink-faint hover:text-accent"
    >
      수정
    </a>
  )
}
