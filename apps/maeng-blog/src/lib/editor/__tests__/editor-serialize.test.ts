// @vitest-environment jsdom
// AC-EDITOR-002 — 에디터 마크다운 직렬화 (GFM 구성요소별, HTML 잔류 없음)
// Milkdown(ProseMirror)은 DOM 의존이므로 jsdom + 최소 Range 셰임으로 헤드리스 검증한다.
// 브라우저 수준(레이아웃/셀렉션 UX) 검증은 M6 수동 스모크로 위임 — src/lib/editor/headless.ts 주석 참조.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// --- ProseMirror jsdom 셰임 (EditorView 생성에 필요한 레이아웃 API 스텁) ---
beforeAll(() => {
  const rect = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }
  Range.prototype.getBoundingClientRect = () => rect as DOMRect
  Range.prototype.getClientRects = () =>
    ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as DOMRectList
  Element.prototype.getClientRects = Range.prototype.getClientRects
  if (!('elementFromPoint' in document) || typeof document.elementFromPoint !== 'function') {
    Object.defineProperty(document, 'elementFromPoint', { value: () => null })
  }
})

import { createHeadlessEditor, serializeEditorMarkdown } from '@/lib/editor/headless'
import type { Editor } from '@milkdown/kit/core'

const GFM_DOCUMENT = `# 제목

일반 문단과 [링크 편집](https://maeng.dev/posts)입니다.

![NodeJS 로고](https://cdn.example.com/blog/images/nodejs.png)

| 이름 | 값 |
| --- | --- |
| alpha | 1 |
| beta | 2 |

- [ ] 할 일 하나
- [x] 끝난 일

\`\`\`ts
const answer: number = 42
\`\`\`
`

let editor: Editor
let markdown: string

beforeAll(async () => {
  editor = await createHeadlessEditor(GFM_DOCUMENT)
  markdown = serializeEditorMarkdown(editor)
})

afterAll(async () => {
  await editor.destroy()
})

describe('에디터 직렬화 — GFM 구성요소 보존 (마크다운 네이티브, REQ-EDITOR-002)', () => {
  it('테이블을 GFM 파이프 문법으로 직렬화한다', () => {
    expect(markdown).toMatch(/\|\s*이름\s*\|\s*값\s*\|/)
    expect(markdown).toMatch(/\|\s*alpha\s*\|\s*1\s*\|/)
  })

  it('태스크 리스트를 - [ ] / - [x] 로 직렬화한다', () => {
    expect(markdown).toMatch(/[-*] \[ \] 할 일 하나/)
    expect(markdown).toMatch(/[-*] \[x\] 끝난 일/)
  })

  it('fenced code block 을 언어 태그와 함께 직렬화한다', () => {
    expect(markdown).toContain('```ts')
    expect(markdown).toContain('const answer: number = 42')
  })

  it('이미지를 마크다운 이미지 참조로 직렬화한다', () => {
    expect(markdown).toContain('![NodeJS 로고](https://cdn.example.com/blog/images/nodejs.png)')
  })

  it('링크를 마크다운 링크 문법으로 직렬화한다', () => {
    expect(markdown).toContain('[링크 편집](https://maeng.dev/posts)')
  })

  it('HTML 태그 잔류가 없다 (HTML→MD 역변환 파이프라인 부재 증명)', () => {
    expect(markdown).not.toMatch(/<\/?(table|thead|tbody|tr|td|th|div|span|p|br|img|a|ul|ol|li)\b/i)
  })
})

describe('에디터 직렬화 — 라운드트립 안정성', () => {
  it('직렬화 결과를 다시 로드해 재직렬화해도 구성요소가 보존된다', async () => {
    const second = await createHeadlessEditor(markdown)
    const remd = serializeEditorMarkdown(second)
    await second.destroy()

    for (const needle of ['| alpha', '```ts', '![NodeJS 로고]', '[링크 편집](https://maeng.dev/posts)']) {
      expect(remd).toContain(needle)
    }
    expect(remd).toMatch(/[-*] \[x\] 끝난 일/)
  })
})
