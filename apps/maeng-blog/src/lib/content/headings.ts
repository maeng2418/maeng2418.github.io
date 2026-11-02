// 목차(TOC) 추출 — rehype-slug 가 부여한 id 를 가진 h2/h3 를 수집하는 rehype 플러그인.
// 렌더 파이프라인(render.ts)에서 rehype-slug 다음, rehype-pretty-code 이전에 실행된다.
// 수집 결과는 vfile.data.headings 에 실리고 renderMarkdown 이 Post.headings 로 노출한다.
import type { Element, Root, RootContent } from 'hast'
import type { VFile } from 'vfile'

export interface Heading {
  id: string
  text: string
  /** 2 | 3 — h1 은 제목과 중복이라 제외, h4 이하는 목차에 과하다 */
  depth: 2 | 3
}

const TOC_TAGS: Record<string, 2 | 3> = { h2: 2, h3: 3 }

function textOf(node: RootContent | Element): string {
  if (node.type === 'text') return node.value
  if (node.type === 'element') return node.children.map(textOf).join('')
  return ''
}

function collect(nodes: RootContent[], out: Heading[]): void {
  for (const node of nodes) {
    if (node.type !== 'element') continue
    const depth = TOC_TAGS[node.tagName]
    const id = node.properties?.id
    if (depth && typeof id === 'string') {
      const text = textOf(node).replace(/\s+/g, ' ').trim()
      if (text) out.push({ id, text, depth })
      continue
    }
    collect(node.children, out)
  }
}

export function rehypeCollectHeadings() {
  return (tree: Root, file: VFile) => {
    const headings: Heading[] = []
    collect(tree.children, headings)
    file.data.headings = headings
  }
}
