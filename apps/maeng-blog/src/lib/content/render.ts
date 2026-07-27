// 마크다운 렌더 파이프라인 — REQ-BLOG-004 (research.md §2 결론: plain-markdown, MDX 배제)
// remark-parse → gfm → math → emoji → remark-rehype(allowDangerousHtml)
// → rehype-raw(레거시 인라인 HTML 보존) → slug(헤딩 앵커) → katex
// → rehype-pretty-code(shiki 단일 테마, 빌드타임 하이라이트) → stringify
//
// @MX:NOTE: [AUTO] shiki는 세밀 번들(fine-grained bundle)로 구성한다 — Cloudflare
// Workers 무료 플랜 3 MiB gzip 상한(AC-M4-006, C-3)을 넘기지 않기 위해 `shiki`
// 전체 패키지(oniguruma WASM 엔진 + 200+ 언어 문법) 대신 content/ 실사용 언어만
// createHighlighterCore + JS 정규식 엔진으로 로드한다. content/ 코드펜스 언어는
// jsx/tsx/json/yaml/html/css 6종뿐(무라벨 펜스는 defaultLang: 'plaintext'로 내장 처리).
// 언어를 추가하려면 이 목록과 langs 배열에 함께 추가해야 한다.
//
// REQ-REG-001 — 테마는 기존 배포본과 동일하게 단일 `github-dark-dimmed`를 사용한다.
// (구 코드는 `themes: { light, dark }`로 작성되어 있었으나 rehype-pretty-code의
// 실제 옵션 키는 `theme`(단수)이라 무시되고 있었다 — 즉 기존 산출물은 이미 항상
// 단일 테마로 렌더링되어 왔다. 여기서 옵션 키만 고쳐 듀얼 테마를 "고치면" 기존
// 정적 산출물의 <article> 바이트가 달라져 REQ-REG-001을 위반하므로, 기존에 실제로
// 방출되던 단일 테마 동작을 그대로 명시적으로 재현한다.)
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

import cssLang from '@shikijs/langs/css'
import htmlLang from '@shikijs/langs/html'
import jsonLang from '@shikijs/langs/json'
import jsxLang from '@shikijs/langs/jsx'
import tsxLang from '@shikijs/langs/tsx'
import yamlLang from '@shikijs/langs/yaml'
import githubDarkDimmedTheme from '@shikijs/themes/github-dark-dimmed'

let highlighterPromise: Promise<HighlighterCore> | undefined

function getContentHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    themes: [githubDarkDimmedTheme],
    langs: [jsxLang, tsxLang, jsonLang, yamlLang, htmlLang, cssLang],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighterPromise
}

const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: 'github-dark-dimmed',
  keepBackground: false,
  defaultLang: 'plaintext',
  // rehype-pretty-code's default type expects the full bundled `shiki` Highlighter;
  // the fine-grained HighlighterCore above is a structurally-compatible subset.
  getHighlighter: getContentHighlighter as unknown as NonNullable<
    RehypePrettyCodeOptions['getHighlighter']
  >,
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkEmoji)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeKatex)
  .use(rehypePrettyCode, rehypePrettyCodeOptions)
  .use(rehypeStringify)

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const file = await processor.process(markdown)
  return String(file)
}
