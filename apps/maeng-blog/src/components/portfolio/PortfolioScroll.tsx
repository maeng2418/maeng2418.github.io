'use client'

// 포트폴리오 스크롤 장면 — REQ-BLOG-006/007, 승인 시안 LUMEN
// (.moai/reports/design/maeng-portfolio-lumen.html — 라이트 에디토리얼 글래스)
// 구조: 연속 캔버스(흐름 섹션) + 핀 7곳 — 장면 카운터 없는 video-scroll 문법 (M6 수동 검증 반영)
//   인트로(핀: businessCard) → 소개(짧은 핀: introduction 유리 슬랫 + 임팩트 지표 — 수치 정적)
//   → 프로젝트(핀: projects 레일 스크럽) → 경력(핀: experiences crossfade 스택)
//   → 일하는 방식(짧은 핀: tech/soft/designSkill) → 타임라인(흐름: timestamp 아래→위 게이지
//   + educations) → 스킬(짧은 핀: skillSets) → 컨택트(핀: 코발트 플러드, 전폭 breakout)
// 모션 엔진: motion/react (REQ-ENH-008 승계) — transform/opacity 만 애니메이트,
// reduced-motion 시 useReducedMotion 분기 + globals.css .pf-* 정적 폴백
import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useTranslations } from 'next-intl'
import { useLocaleToggle } from '@/components/i18n/LocaleProvider'
import type { Locale } from '@/lib/i18n/locale'
import { toggleLocale } from '@/lib/i18n/locale'
import { getPortfolioContent, getResumeHref } from '@/lib/portfolio/content'
import { pinHeight } from '@/components/portfolio/pin-config'
import { computeRailMax, pickActiveChapter } from '@/components/portfolio/scroll-logic'

const STAGGER_STEP_MS = 70

const CHAPTER_IDS = ['pf-s0', 'pf-s1', 'pf-s2', 'pf-s3', 'pf-s4', 'pf-s5', 'pf-s6', 'pf-s7']
const CHAPTER_LABELS = [
  'Intro',
  'About',
  'Projects',
  'Career',
  'Creed',
  'Timeline',
  'Skills',
  'Contact',
]

/** 기존 CSS 트랜지션(ease) 승계 — 타이밍/트리거 값 보존 (REQ-ENH-008) */
const REVEAL_EASE = [0.25, 0.1, 0.25, 1] as const

// 임팩트 지표 — 이력서 성과(놀유니버스 achievements) 기반 UI 크롬. 콘텐츠 카탈로그가 아닌
// 디자인 요소라 컴포넌트 상수로 관리한다 (승인 시안 LUMEN §About figures)
const FIGURES: Record<Locale, { value: number; dec: number; suffix: string; label: string }[]> = {
  ko: [
    { value: 99.3, dec: 1, suffix: '%', label: '빌드 시간 단축' },
    { value: 40, dec: 0, suffix: '%', label: '버그 리포팅 감소' },
    { value: 12, dec: 0, suffix: '+', label: '모노레포 패키지' },
    { value: 4.8, dec: 1, suffix: 'y', label: 'FE 경력' },
  ],
  en: [
    { value: 99.3, dec: 1, suffix: '%', label: 'Build time cut' },
    { value: 40, dec: 0, suffix: '%', label: 'Bug reports down' },
    { value: 12, dec: 0, suffix: '+', label: 'Monorepo packages' },
    { value: 4.8, dec: 1, suffix: 'y', label: 'FE experience' },
  ],
}

function DownloadIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="-mb-px inline-block"
    >
      <path d="M12 3v13m0 0-5.5-5.5M12 16l5.5-5.5M5 21h14" />
    </svg>
  )
}

/** 흐름 섹션 뒤 워터마크 타이포 — 스크롤 속도차 드리프트 (깊이 레이어) */
function BgWord({ children, factor }: { children: string; factor: number }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [factor * 260, factor * -260])
  return (
    <motion.span
      ref={ref}
      className="pf-bg-word"
      style={reduced ? undefined : { y }}
      aria-hidden
    >
      {children}
    </motion.span>
  )
}

/** 임팩트 지표 — 수치는 스크롤과 무관하게 상시 최종값 고정 (M6 보충: 카운트업 제거,
 *  사용자 결정). pill 전체의 등장(PinReveal 스태거)만 모션에 참여한다 */
function Figure({
  value,
  dec,
  suffix,
  label,
}: {
  value: number
  dec: number
  suffix: string
  label: string
}) {
  return (
    <div>
      <b>
        {value.toFixed(dec)}
        {suffix}
      </b>
      <span>{label}</span>
    </div>
  )
}

/** 경력 crossfade 카드 — 핀 진행도의 1/n 슬롯 구간에서 등장→퇴장 */
function CareerCard({
  index,
  count,
  progress,
  children,
}: {
  index: number
  count: number
  progress: MotionValue<number>
  children: React.ReactNode
}) {
  const reduced = useReducedMotion()
  const slot = 1 / count
  const a = index * slot
  // M6 fix 3: 첫 카드는 핀 진입 즉시 완전 표시(밴드가 진행도 0 이전에 완료 — 빈 프레임 금지),
  // 전이 폭을 슬롯의 12% 로 줄여 카드별 정지(hold) 구간을 대폭 연장한다
  const first = index === 0
  const enterStart = first ? -0.2 : a
  const enterEnd = first ? -0.1 : a + slot * 0.12
  const last = index === count - 1
  const exitStart = last ? 2 : (index + 1) * slot - slot * 0.12
  const exitEnd = last ? 3 : (index + 1) * slot
  const opacity = useTransform(progress, [enterStart, enterEnd, exitStart, exitEnd], [0, 1, 1, 0])
  const y = useTransform(progress, [enterStart, enterEnd, exitStart, exitEnd], [40, 0, 0, -30])
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? 'auto' : 'none'))
  return (
    <motion.article
      className="pf-glass pf-career-card"
      style={reduced ? undefined : { opacity, y, pointerEvents }}
    >
      {children}
    </motion.article>
  )
}

/** 타임라인 항목 — 아래(과거)부터 점등 (REQ: 게이지 역방향) */
function TimelineItem({
  indexFromBottom,
  count,
  progress,
  when,
  children,
}: {
  indexFromBottom: number
  count: number
  progress: MotionValue<number>
  when: string
  children: React.ReactNode
}) {
  const reduced = useReducedMotion()
  const k = indexFromBottom
  const opacity = useTransform(progress, [Math.max(0, k / count - 0.05), (k + 0.9) / count], [0.3, 1])
  const litOpacity = useTransform(progress, (v) => (v >= (k + 0.5) / count ? 1 : 0))
  return (
    <motion.div className="pf-tl-item" style={reduced ? undefined : { opacity }}>
      <motion.i className="dotlit" style={reduced ? undefined : { opacity: litOpacity }} aria-hidden />
      <span className="when font-mono">{when}</span>
      <span>{children}</span>
    </motion.div>
  )
}

/** 짧은 핀 섹션 콘텐츠 리빌 — 핀 진행도 밴드에서 스태거 등장, 언핀 훨씬 전(~0.5)에 완독 가능
 *  (M6 fix 4/6: creed·skills 핀 전환용 → M6 보충: about 핀에도 공용. reduced-motion 시 정적 완전 표시) */
function PinReveal({
  index,
  progress,
  className,
  dataSection,
  children,
}: {
  index: number
  progress: MotionValue<number>
  className?: string
  dataSection?: string
  children: React.ReactNode
}) {
  const reduced = useReducedMotion()
  const start = Math.min(0.05 + index * 0.08, 0.35)
  const opacity = useTransform(progress, [start, start + 0.16], [0, 1])
  const y = useTransform(progress, [start, start + 0.16], [34, 0])
  return (
    <motion.div
      className={className}
      data-section={dataSection}
      style={reduced ? undefined : { opacity, y }}
    >
      {children}
    </motion.div>
  )
}

export default function PortfolioScroll() {
  // 로케일 상태/토글/지속은 LocaleProvider 가 단일 관리한다 (REQ-ENH-002)
  const { locale, toggle: onToggleLocale } = useLocaleToggle()
  const t = useTranslations('portfolio')
  const reduced = useReducedMotion()

  const rootRef = useRef<HTMLDivElement>(null)
  const introPinRef = useRef<HTMLDivElement>(null)
  const aboutPinRef = useRef<HTMLDivElement>(null)
  const projPinRef = useRef<HTMLDivElement>(null)
  const railWrapRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const careerPinRef = useRef<HTMLDivElement>(null)
  const creedPinRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<HTMLElement>(null)
  const skillsPinRef = useRef<HTMLDivElement>(null)
  const contactPinRef = useRef<HTMLDivElement>(null)

  // 흐름 섹션 등장 — motion variants (threshold 0.2 · step 70ms 승계)
  const groupVariants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : STAGGER_STEP_MS / 1000 } },
  }
  const itemVariants = reduced
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 28 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: REVEAL_EASE } },
      }
  const groupProps = {
    initial: 'hidden' as const,
    whileInView: 'show' as const,
    viewport: { once: true, amount: 0.2 },
    variants: groupVariants,
  }

  // 전역 재생 타임라인 (상단 헤어라인)
  const { scrollYProgress: pageProgress } = useScroll()

  // 인트로: 정착 유지 → 후반 물러남
  const { scrollYProgress: introProgress } = useScroll({
    target: introPinRef,
    offset: ['start start', 'end end'],
  })
  const introY = useTransform(introProgress, [0, 0.58, 1], [0, 0, -50])
  const introOpacity = useTransform(introProgress, [0, 0.58, 1], [1, 1, 0.1])
  const hintOpacity = useTransform(introProgress, [0.02, 0.12], [1, 0])

  // M6 보충: 소개 짧은 핀 진행도 — PinReveal 스태거 공급 (지표 수치는 정적)
  // (핀 전환으로 진행도 도메인이 'start start'→'end end' 스크럽으로 변경)
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutPinRef,
    offset: ['start start', 'end end'],
  })

  // 프로젝트 레일 스크럽
  const { scrollYProgress: projProgress } = useScroll({
    target: projPinRef,
    offset: ['start start', 'end end'],
  })
  // M6 fix 2: 스크럽을 0.85 에서 완료 — 언핀 전 정착(settle) 여백 확보. 마지막 카드의
  // 좌측 도달은 globals.css .pf-rail::after 후행 스페이서(래퍼 폭 − 카드 폭)가 담당한다
  const railProgress = useTransform(projProgress, [0.14, 0.85], [0, 1], { clamp: true })
  // railMax 는 MotionValue — ResizeObserver 재측정이 이후 스크럽에 즉시 반영된다
  // (REQ-RAIL-001..002: 리사이즈·폰트 로드·로케일 전환에 의한 콘텐츠 폭 변동 대응,
  //  스크롤 이벤트마다의 재측정 금지)
  const railMax = useMotionValue(0)
  useEffect(() => {
    const measure = () => {
      railMax.set(
        computeRailMax(railRef.current?.scrollWidth ?? 0, railWrapRef.current?.clientWidth ?? 0)
      )
    }
    measure()
    // jsdom 등 ResizeObserver 부재 환경 가드 (acceptance E-7) — resize 폴백
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }
    const observer = new ResizeObserver(measure)
    if (railWrapRef.current) observer.observe(railWrapRef.current)
    // 레일 콘텐츠 폭 변동(폰트 정착·로케일 텍스트 폭)은 카드 자식 요소에서 관측된다
    if (railRef.current) {
      for (const child of Array.from(railRef.current.children)) observer.observe(child)
    }
    return () => observer.disconnect()
  }, [locale, railMax])
  const railX = useTransform(
    [railProgress, railMax] as const,
    ([progress, max]: number[]) => -progress * max
  )
  const railBarWidth = useTransform(railProgress, (progress) => `${progress * 100}%`)
  const [railIdx, setRailIdx] = useState(1)
  useMotionValueEvent(railProgress, 'change', (v) => {
    setRailIdx((prev) => {
      const next = Math.min(4, 1 + Math.floor(v * 4))
      return next === prev ? prev : next
    })
  })

  // 경력 crossfade 진행도
  const { scrollYProgress: careerRaw } = useScroll({
    target: careerPinRef,
    offset: ['start start', 'end end'],
  })
  // M6 fix 3: 진입 데드존(0.12) 제거 — 핀 진입 순간 첫 카드 완전 표시, 330vh 예산 전체 사용
  const careerProgress = useTransform(careerRaw, [0, 0.96], [0, 1], { clamp: true })
  const careerBarWidth = useTransform(careerProgress, (progress) => `${progress * 100}%`)
  const [careerIdx, setCareerIdx] = useState(1)
  useMotionValueEvent(careerProgress, 'change', (v) => {
    setCareerIdx((prev) => {
      const next = Math.min(3, 1 + Math.floor(v * 3))
      return next === prev ? prev : next
    })
  })

  // M6 fix 4/6: creed·skills 짧은 핀 진행도 (PinReveal 스태거 공급)
  const { scrollYProgress: creedProgress } = useScroll({
    target: creedPinRef,
    offset: ['start start', 'end end'],
  })
  const { scrollYProgress: skillsProgress } = useScroll({
    target: skillsPinRef,
    offset: ['start start', 'end end'],
  })

  // 타임라인: 아래→위 게이지
  // M6 fix 5: 게이지가 섹션이 화면에 남아 있는 동안 100% 도달하도록 종점을 당긴다
  // (end 0.8 = 섹션 하단이 뷰포트 80% 선 통과 시 진행도 1 — 최상단 항목까지 점등 보장)
  const { scrollYProgress: tlRaw } = useScroll({
    target: tlRef,
    offset: ['start 0.9', 'end 0.8'],
  })
  const tlProgress = useTransform(tlRaw, [0.08, 0.85], [0, 1], { clamp: true })
  const tlFillHeight = useTransform(tlProgress, (progress) => `${progress * 100}%`)

  // 컨택트 — 콘텐츠 리빌 (코발트 플러드 색반전은 사용자 결정으로 제거)
  const { scrollYProgress: contactProgress } = useScroll({
    target: contactPinRef,
    offset: ['start start', 'end end'],
  })
  const contactY = useTransform(contactProgress, [0.25, 0.7], [60, 0])

  // 챕터 내비 활성 추적 — IntersectionObserver (REQ-SCROLL-001..002)
  // rootMargin -50%/-50% 로 관측 루트를 뷰포트 중앙선으로 좁혀, 기존
  // "top<=mid && bottom>=mid" gBCR 판정과 동등한 결과를 스크롤 이벤트·강제
  // 레이아웃 없이 얻는다. jsdom 등 Observer 부재 환경에서는 조용히 건너뛴다 (E-7).
  const [activeChapter, setActiveChapter] = useState(0)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const indexById = new Map(CHAPTER_IDS.map((id, i) => [id, i]))
    const observer = new IntersectionObserver(
      (entries) => {
        const updates = entries
          .map((entry) => ({
            index: indexById.get(entry.target.id) ?? -1,
            isIntersecting: entry.isIntersecting,
          }))
          .filter((update) => update.index >= 0)
        setActiveChapter((prev) => pickActiveChapter(prev, updates))
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    )
    for (const id of CHAPTER_IDS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  const c = getPortfolioContent(locale)
  const resumeHref = getResumeHref(locale)
  const otherResumeHref = getResumeHref(toggleLocale(locale))
  const figures = FIGURES[locale]
  const tlCount = c.timestamp.items.length
  const accent = (chunks: React.ReactNode) => <span className="pf-blue">{chunks}</span>

  return (
    <div ref={rootRef} className="pf-lumen">
      {/* 색 리본 — 유리 아래로 지나가는 채도 필드 */}
      <div className="pf-ribbons" aria-hidden />

      {/* 전역 재생 타임라인 헤어라인 */}
      <motion.div
        className="pf-progress"
        style={reduced ? undefined : { scaleX: pageProgress }}
        aria-hidden
      />

      {/* 챕터 내비 (데스크톱) */}
      <nav className="pf-chapters" aria-label={locale === 'ko' ? '섹션 이동' : 'Sections'}>
        {CHAPTER_IDS.map((id, i) => (
          <a
            key={id}
            href={`#${id}`}
            className={i === activeChapter ? 'active' : ''}
            onClick={(event) => {
              // 전역 smooth 스크롤로 300vh+ 핀 구간을 가로지르면 스크럽 애니메이션이
              // 길게 재생된다 (REQ-NAV-001). 포트폴리오 내부 앵커만 즉시 이동으로
              // 제어하고 전역 html { scroll-behavior } 는 유지한다 (REQ-NAV-002)
              event.preventDefault()
              document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
            }}
          >
            <span className="lbl">{CHAPTER_LABELS[i]}</span>
            <span className="dot" />
          </a>
        ))}
      </nav>

      {/* 우상단 고정 액션 — 다운로드 + 번역 토글 (레거시 배치 패리티) */}
      <div className="fixed top-20 right-5 z-40 flex gap-2 md:right-8">
        <a
          data-section="downloadButton"
          href={resumeHref}
          download
          className="pf-btn-solid rounded-full px-4 py-2 text-[13px] font-semibold no-underline transition-opacity hover:opacity-90"
        >
          <DownloadIcon /> {t('actions.download')}
        </a>
        <button
          data-section="translateButton"
          type="button"
          onClick={onToggleLocale}
          aria-label={t('actions.translateAria')}
          className="pf-glass cursor-pointer rounded-full px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:text-accent"
        >
          {t('actions.translate')}
        </button>
      </div>

      {/* ── 인트로 (핀) — businessCard ─────────────────────────────── */}
      <div ref={introPinRef} id="pf-s0" className="pf-pin" style={{ height: pinHeight('intro') }}>
        <section data-section="businessCard" className="pf-frame" aria-label={c.businessCard.title}>
          <div className="pf-wrap">
            <p className="pf-kicker">{c.title}</p>
            <motion.h1
              style={reduced ? undefined : { y: introY, opacity: introOpacity }}
              className="pf-display pf-fx"
            >
              {t.rich('heroRich', {
                name: c.businessCard.name,
                role: c.businessCard.role,
                br: () => <br />,
                accent,
              })}
            </motion.h1>
            <motion.div {...groupProps}>
              <motion.p variants={itemVariants} className="pf-sub">
                {c.businessCard.tagline}
                <br />
                <span className="text-[13px] font-semibold tracking-[0.08em] uppercase text-ink-faint">
                  {c.businessCard.career}
                </span>
              </motion.p>
              <motion.ul variants={itemVariants} className="pf-contacts">
                {c.businessCard.contacts.map((contact) => (
                  <li key={contact.label}>
                    <a
                      href={contact.href}
                      {...(contact.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {contact.value} ↗
                    </a>
                  </li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
          <motion.div
            className="pf-scroll-hint"
            style={reduced ? undefined : { opacity: hintOpacity }}
          >
            SCROLL
          </motion.div>
        </section>
      </div>

      {/* ── 소개 (핀, M6 보충) — introduction + 임팩트 지표 ─────────────── */}
      <div
        ref={aboutPinRef}
        id="pf-s1"
        className="pf-pin"
        style={{ height: pinHeight('about') }}
      >
        <section
          data-section="introduction"
          className="pf-frame pf-about-frame"
          aria-label={c.introduction.title}
        >
          <span className="pf-bg-word" aria-hidden>
            About
          </span>
          <div className="pf-wrap">
            <div className="pf-head">
              <h2 className="pf-h2">{c.introduction.headline}</h2>
            </div>
            <div className="pf-content" style={{ maxWidth: 900 }}>
              <div className="flex flex-col gap-3">
                {c.introduction.values.map((value, i) => (
                  <PinReveal
                    key={value.title}
                    index={i}
                    progress={aboutProgress}
                    className="pf-glass pf-slat"
                  >
                    <b>{value.title}</b>
                    <p>{value.description}</p>
                  </PinReveal>
                ))}
              </div>
              {/* 지표 pill 은 마지막 카드와 같은 밴드(index 3)로 등장 — 핀 전반(~0.45)
                  내 완독 가능. 수치는 상시 최종값 고정 (카운트업 제거, M6 보충) */}
              <PinReveal index={3} progress={aboutProgress} className="pf-glass pf-figures">
                {figures.map((figure) => (
                  <Figure key={figure.label} {...figure} />
                ))}
              </PinReveal>
              <PinReveal index={4} progress={aboutProgress}>
                <p className="pf-summary">{c.businessCard.summary.join(' ')}</p>
              </PinReveal>
            </div>
          </div>
        </section>
      </div>

      {/* ── 프로젝트 (핀 레일) — projects ────────────────────────────── */}
      <div ref={projPinRef} id="pf-s2" className="pf-pin" style={{ height: pinHeight('projects') }}>
        <section data-section="projects" className="pf-frame" aria-label={c.projects.title}>
          <div className="pf-wrap">
            <h2 className="pf-h2">
              <span className="pf-kicker block">{c.projects.title}</span>
              {c.projects.headline}
            </h2>
            <div ref={railWrapRef} className="mt-8 w-full overflow-hidden">
              <motion.div
                ref={railRef}
                style={reduced ? undefined : { x: railX }}
                className="pf-rail flex gap-[18px] px-1 py-2"
              >
                {c.projects.items.map((project) => (
                  <article key={project.title} className="pf-glass pf-proj">
                    <span className="term font-mono">
                      {project.term} · {project.kind}
                    </span>
                    <h3>
                      {project.link ? (
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                          {project.title} ↗
                        </a>
                      ) : (
                        project.title
                      )}
                    </h3>
                    <p className="line-clamp-4">{project.description}</p>
                    <div className="pf-tags">
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    {project.github && (
                      <a
                        className="mt-3 inline-block text-[12px] font-semibold text-accent no-underline hover:underline"
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </article>
                ))}
              </motion.div>
            </div>
            <div className="pf-meta">
              <span className="pf-count font-mono">
                <b>{String(railIdx).padStart(2, '0')}</b> /{' '}
                {String(c.projects.items.length).padStart(2, '0')}
              </span>
              <span className="pf-bar">
                <motion.i style={reduced ? undefined : { width: railBarWidth }} />
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── 경력 (핀 crossfade) — experiences ────────────────────────── */}
      <div ref={careerPinRef} id="pf-s3" className="pf-pin" style={{ height: pinHeight('career') }}>
        <section data-section="experiences" className="pf-frame" aria-label={c.experiences.title}>
          <div className="pf-wrap">
            <div className="pf-head flex flex-wrap items-baseline gap-x-8 gap-y-3">
              <h2 className="pf-h2 m-0">
                <span className="pf-kicker block">{c.experiences.title}</span>
                {c.experiences.headline}
              </h2>
              <div className="pf-meta !mt-0 mb-1.5">
                <span className="pf-count font-mono">
                  <b>{String(careerIdx).padStart(2, '0')}</b> /{' '}
                  {String(c.experiences.items.length).padStart(2, '0')}
                </span>
                <span className="pf-bar">
                  <motion.i style={reduced ? undefined : { width: careerBarWidth }} />
                </span>
              </div>
            </div>
            <div className="pf-career-stack pf-content">
              {c.experiences.items.map((experience, i) => (
                <CareerCard
                  key={experience.company}
                  index={i}
                  count={c.experiences.items.length}
                  progress={careerProgress}
                >
                  <header className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3>{experience.company}</h3>
                    <span className="term font-mono">{experience.term}</span>
                  </header>
                  <p className="desc">{experience.description}</p>
                  <ul>
                    {experience.keyProjects.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <details className="mt-3 text-[13px] text-ink-soft">
                    <summary className="cursor-pointer font-semibold text-accent">
                      {c.experiences.viewAchievements}
                    </summary>
                    <ul className="mt-2">
                      {experience.achievements.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </details>
                  <div className="pf-tags mt-4">
                    {experience.techStack.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                </CareerCard>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── 일하는 방식 (핀, M6 fix 4) — techSkill / softSkill / designSkill ──── */}
      <div ref={creedPinRef} id="pf-s4" className="pf-pin" style={{ height: pinHeight('creed') }}>
        <section className="pf-frame" aria-label={c.techSkill.title}>
          <span className="pf-bg-word" aria-hidden>
            Craft
          </span>
          <div className="pf-wrap">
            <div className="pf-head pf-head-right">
              <h2 className="pf-h2">{locale === 'ko' ? '이렇게 일합니다' : 'How I work'}</h2>
            </div>
            <div className="pf-content pf-creed-wrap">
              <div className="pf-creed">
                {(
                  [
                    ['techSkill', '01', c.techSkill],
                    ['softSkill', '02', c.softSkill],
                    ['designSkill', '03', c.designSkill],
                  ] as const
                ).map(([id, no, skill], i) => (
                  <PinReveal
                    key={id}
                    index={i}
                    progress={creedProgress}
                    className="pf-creed-item"
                    dataSection={id}
                  >
                    <b>
                      <span className="no">{no}</span>
                      {skill.title}
                    </b>
                    <ul>
                      {skill.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </PinReveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── 타임라인 (흐름, 아래→위) — timestamp + educations ─────────── */}
      <section
        ref={tlRef}
        id="pf-s5"
        data-section="timestamp"
        className="pf-flow"
        aria-label={c.timestamp.title}
      >
        <BgWord factor={0.6}>Path</BgWord>
        <div className="pf-wrap">
          <div className="pf-head pf-head-indent">
            <h2 className="pf-h2">{c.timestamp.headline}</h2>
          </div>
          <div className="pf-glass pf-tl pf-content">
            <div className="pf-tl-line">
              <motion.i style={reduced ? undefined : { height: tlFillHeight }} />
            </div>
            {c.timestamp.items.map((item, i) => (
              <TimelineItem
                key={`${item.when}-${item.title}`}
                indexFromBottom={tlCount - 1 - i}
                count={tlCount}
                progress={tlProgress}
                when={item.when}
              >
                <b>{item.title}</b>
                {item.current && <span className="now">{c.timestamp.currentBadge}</span>}
                <br />
                <span className="org">{item.organizer}</span>
              </TimelineItem>
            ))}
            <div className="pf-edu" data-section="educations" aria-label={c.educations.title}>
              <span className="pf-kicker block">{c.educations.title}</span>
              {c.educations.items.map((education) => (
                <div key={education.title} className="pf-tl-item static">
                  <span className="when font-mono">{education.term}</span>
                  <span>
                    <b>{education.title}</b>
                    <br />
                    <span className="org">{education.description}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 스킬 (핀, M6 fix 6) — skillSets ──────────────────────────── */}
      <div ref={skillsPinRef} id="pf-s6" className="pf-pin" style={{ height: pinHeight('skills') }}>
        <section data-section="skillSets" className="pf-frame" aria-label={c.skillSets.title}>
          <span className="pf-bg-word" aria-hidden>
            Tools
          </span>
          <div className="pf-wrap">
            <div className="pf-head">
              <h2 className="pf-h2">{c.skillSets.headline}</h2>
            </div>
            <div className="pf-content pf-skills-wrap">
              {c.skillSets.groups.map((group, i) => (
                <PinReveal
                  key={group.label}
                  index={i}
                  progress={skillsProgress}
                  className="pf-glass pf-chip-group"
                >
                  <span className="label">{group.label}</span>
                  <div className="pf-chips">
                    {group.skills.map((skill) => {
                      const hot = group.highlights?.includes(skill)
                      return (
                        <span key={skill} className={`pf-chip ${hot ? 'hot' : ''}`}>
                          {skill}
                        </span>
                      )
                    })}
                  </div>
                </PinReveal>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── 컨택트 ────────────────────────────────────────────────────── */}
      <div
        ref={contactPinRef}
        id="pf-s7"
        className="pf-pin"
        style={{ height: pinHeight('contact') }}
      >
        <section className="pf-frame pf-contact-frame" aria-label={c.contact.title}>
          <div className="pf-wrap text-center">
            <p className="pf-kicker">{c.contact.title}</p>
            <motion.h2
              className="pf-display"
              style={reduced ? undefined : { y: contactY }}
            >
              {t.rich('contactHeadlineRich', { accent })}
            </motion.h2>
            <p className="pf-sub mx-auto">{c.contact.description}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a href={resumeHref} download className="pf-btn-invert">
                <DownloadIcon /> {t('actions.downloadPrimary')}
              </a>
              <a href={otherResumeHref} download className="pf-btn-ghost">
                <DownloadIcon /> {t('actions.downloadOther')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
