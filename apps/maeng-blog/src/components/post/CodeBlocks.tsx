'use client'

// 코드 블록 바 — rehype-pretty-code figure 에 언어/파일명 라벨 + 복사 버튼을 마운트 후 부착한다.
// 본문은 dangerouslySetInnerHTML 로 들어오므로 React 트리 밖에서 DOM 을 직접 꾸민다 (언마운트 시 제거).
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

const COPIED_MS = 1600

export default function CodeBlocks() {
  const t = useTranslations('post')
  const copyLabel = t('copy')
  const copiedLabel = t('copied')

  useEffect(() => {
    const figures = Array.from(
      document.querySelectorAll<HTMLElement>('figure[data-rehype-pretty-code-figure]')
    )
    const cleanups: (() => void)[] = []

    for (const figure of figures) {
      if (figure.querySelector(':scope > .code-bar')) continue
      const pre = figure.querySelector('pre')
      if (!pre) continue
      const caption = figure.querySelector('figcaption')
      const label = caption?.textContent?.trim() || pre.dataset.language || 'code'
      caption?.remove()

      const bar = document.createElement('div')
      bar.className = 'code-bar'
      const name = document.createElement('span')
      name.textContent = label
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = copyLabel
      bar.append(name, button)
      figure.prepend(bar)

      let timer = 0
      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(pre.textContent ?? '')
          button.textContent = copiedLabel
          window.clearTimeout(timer)
          timer = window.setTimeout(() => {
            button.textContent = copyLabel
          }, COPIED_MS)
        } catch {
          // 클립보드 권한 거부 — 라벨 유지
        }
      }
      button.addEventListener('click', onClick)
      cleanups.push(() => {
        button.removeEventListener('click', onClick)
        window.clearTimeout(timer)
        bar.remove()
        if (caption) figure.prepend(caption)
      })
    }
    return () => cleanups.forEach((fn) => fn())
  }, [copyLabel, copiedLabel])

  return null
}
