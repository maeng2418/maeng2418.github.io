'use client'

// giscus 댓글 — REQ-ENH-006 (design.md §6)
// env 구동: NEXT_PUBLIC_GISCUS_* 4값(repo/repoId/category/categoryId)이 전부 존재할 때만
// 렌더한다. 부재 시 렌더 생략 — 빌드/페이지 오류 없음 (§D.2 엣지 케이스). 값은 사용자가
// GitHub 저장소 설정(public + Discussions + giscus App) 후 추후 채운다 (plan.md §B 결정).
// 프리렌더(정적 export) 시점에는 항상 미렌더(mounted 게이트) — 상세 HTML 에 giscus 마크업이
// 남지 않고, 테마(preferred_color_scheme)/lang(현재 로케일)은 클라이언트에서 결정된다.
import { useEffect, useState } from 'react'
import Giscus from '@giscus/react'
import { useTranslations } from 'next-intl'
import { useLocaleToggle } from '@/components/i18n/LocaleProvider'

const GISCUS_REPO = process.env.NEXT_PUBLIC_GISCUS_REPO
const GISCUS_REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
const GISCUS_CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY
const GISCUS_CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID

export default function Comments() {
  const t = useTranslations('comments')
  const { locale } = useLocaleToggle()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 4값 전부 존재해야 렌더 (REQ-ENH-006) — 마운트 전(정적 HTML)에도 미렌더
  if (!mounted || !GISCUS_REPO || !GISCUS_REPO_ID || !GISCUS_CATEGORY || !GISCUS_CATEGORY_ID) {
    return null
  }

  return (
    <section aria-label={t('title')} className="mt-16 border-t border-line pt-8">
      <Giscus
        repo={GISCUS_REPO as `${string}/${string}`}
        repoId={GISCUS_REPO_ID}
        category={GISCUS_CATEGORY}
        categoryId={GISCUS_CATEGORY_ID}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="preferred_color_scheme"
        lang={locale}
        loading="lazy"
      />
    </section>
  )
}
