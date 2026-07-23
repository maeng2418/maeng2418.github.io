// 마크다운 렌더 파이프라인 — REQ-BLOG-004 (research.md §2 결론: plain-markdown, MDX 배제)
// remark-parse → gfm → math → emoji → remark-rehype(allowDangerousHtml)
// → rehype-raw(레거시 인라인 HTML 보존) → slug(헤딩 앵커) → katex
// → rehype-pretty-code(shiki 듀얼 테마, 빌드타임 하이라이트) → stringify

import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkEmoji)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeKatex)
  .use(rehypePrettyCode, {
    themes: { light: 'github-light', dark: 'github-dark' },
    keepBackground: false,
    defaultLang: 'plaintext',
  })
  .use(rehypeStringify)

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const file = await processor.process(markdown)
  return String(file)
}
