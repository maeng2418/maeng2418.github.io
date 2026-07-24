// Milkdown 헤드리스 어댑터 심(seam) — 테스트 가능성 설계 (REQ-EDITOR-002 / AC-EDITOR-002)
// 에디터 문서 ↔ 마크다운 직렬화를 React 컴포넌트에서 분리해, vitest/jsdom 에서
// DOM 마운트 없이(오프스크린 div) GFM 직렬화를 검증할 수 있게 한다.
//
// 브라우저 수준 검증이 필요한 잔여 영역(M6 수동 스모크 대상):
//  - 셀렉션/커서 UX, 테이블 편집 인터랙션, IME 입력, 클립보드 붙여넣기
//  - jsdom 은 레이아웃 API 가 스텁이므로 위 영역은 여기서 검증하지 않는다.
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/kit/core'
import { clipboard } from '@milkdown/kit/plugin/clipboard'
import { history } from '@milkdown/kit/plugin/history'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { gfm } from '@milkdown/kit/preset/gfm'
import { getMarkdown } from '@milkdown/kit/utils'

export interface EditorOptions {
  root?: HTMLElement
  onMarkdownUpdated?: (markdown: string) => void
}

/** GFM 포함 공통 플러그인 셋으로 Editor 인스턴스를 생성한다 (컴포넌트/테스트 공용) */
export function configureEditor(editor: Editor, defaultValue: string, options: EditorOptions = {}) {
  return editor
    .config((ctx) => {
      ctx.set(rootCtx, options.root ?? document.createElement('div'))
      ctx.set(defaultValueCtx, defaultValue)
      if (options.onMarkdownUpdated) {
        ctx
          .get(listenerCtx)
          .markdownUpdated((_ctx, markdown) => options.onMarkdownUpdated?.(markdown))
      }
    })
    .use(commonmark)
    .use(gfm)
    .use(history)
    .use(clipboard)
    .use(listener)
}

/** 오프스크린 루트로 에디터를 생성한다 — 직렬화 검증용 헤드리스 경로 */
export async function createHeadlessEditor(defaultValue: string): Promise<Editor> {
  return configureEditor(Editor.make(), defaultValue).create()
}

/** 현재 에디터 문서를 마크다운으로 직렬화한다 (HTML→MD 역변환 파이프라인 없음) */
export function serializeEditorMarkdown(editor: Editor): string {
  return editor.action(getMarkdown())
}
