'use client'

// 포트폴리오 스크롤 장면 — 시안 v18 (D안 v2 문법 + portfolio_02 이력서)
// 구조: 핀 4곳(히어로 단어 리빌 → 핵심 성과 카운터 → 경력 타임라인 → 프로젝트 4단계 재생)
//       + 흐름 섹션 3곳(보유 스킬 / 표준 수립·구조 개선 / 활동·학력 + PDF 카드) + 컨택트.
// 모션 엔진: 스크롤 진행률을 CSS 변수(--p, --sp)로 흘려보내고 CSS calc 가 리빌을 계산한다.
//   React 상태는 이산적으로 바뀌는 값(현재 프로젝트·단계, 활성 레일)만 가진다.
//   카운터 텍스트·게이지 폭은 rAF 안에서 DOM 에 직접 쓴다 (스크롤마다 리렌더 금지).
// reduced-motion: 스크롤 리스너를 달지 않고 globals.css .pf-* 정적 폴백이 전부를 펼쳐 보인다.
import { useEffect, useRef, useState } from 'react'
import { useLocaleToggle } from '@/components/i18n/LocaleProvider'
import {
  KPI_VISUALS,
  PORTFOLIO_SECTION_IDS,
  getPortfolioContent,
  getResumeHref,
  type PortfolioSectionId,
} from '@/lib/portfolio/content'
import { pinHeight } from '@/components/portfolio/pin-config'
import {
  formatCounter,
  interpolate,
  kpiPhase,
  pickActiveSection,
  pinProgress,
  projectScrollTop,
  projectStage,
  type ProjectStage,
} from '@/components/portfolio/scroll-logic'

const WORK_ID = 'pf-work'
/** globals.css 정적 폴백과 동일 조건 — 핀을 풀고 카운터를 최종값으로 고정 */
const STATIC_MQ = '(prefers-reduced-motion: reduce), (max-width: 860px)'

function isSectionId(value: string | undefined): value is PortfolioSectionId {
  return (PORTFOLIO_SECTION_IDS as readonly string[]).includes(value ?? '')
}

export default function PortfolioScroll() {
  const { locale, toggle } = useLocaleToggle()
  const c = getPortfolioContent(locale)
  const rootRef = useRef<HTMLDivElement>(null)
  const reduceRef = useRef(false)
  const [stage, setStage] = useState<ProjectStage>({ index: 0, step: 0 })
  const [active, setActive] = useState<PortfolioSectionId>('top')
  const projectCount = c.work.items.length

  // 스크롤 스크럽 — 핀 진행률(--p), 상단 진행바(--sp), 카운터, 프로젝트 단계
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reduceRef.current = reduce
    const staticMq = window.matchMedia(STATIC_MQ)
    const pins = Array.from(root.querySelectorAll<HTMLElement>('[data-pin]'))
    const counters = Array.from(root.querySelectorAll<HTMLElement>('[data-counter]'))
    const gauges = Array.from(root.querySelectorAll<HTMLElement>('[data-gauge]'))
    let raf = 0
    let last: ProjectStage = { index: -1, step: -1 }

    const paintKpi = (p: number) => {
      KPI_VISUALS.forEach((v, i) => {
        if (v.kind === 'check') return
        const q = kpiPhase(p, i)
        const counter = counters.find((el) => el.dataset.counter === String(i))
        if (counter) counter.textContent = formatCounter(interpolate(v.from, v.to, q), v.decimals, v.unit)
        if (v.kind === 'line') {
          const gauge = gauges.find((el) => el.dataset.gauge === String(i))
          if (gauge) gauge.style.width = `${Math.max(1, interpolate(100, v.barTo, q))}%`
        }
      })
    }

    const tick = () => {
      raf = 0
      if (staticMq.matches) {
        // 정적 폴백: CSS 가 전부를 펼쳐 보이므로 카운터만 최종값으로 고정
        paintKpi(1)
        return
      }
      const vh = window.innerHeight || 720
      const max = document.documentElement.scrollHeight - vh
      root.style.setProperty('--sp', (max > 0 ? window.scrollY / max : 0).toFixed(4))
      for (const section of pins) {
        const p = pinProgress(section.getBoundingClientRect().top, section.offsetHeight, vh)
        section.style.setProperty('--p', p.toFixed(4))
        if (section.dataset.pin === 'kpi') paintKpi(p)
        if (section.dataset.pin === 'work') {
          const next = projectStage(p, projectCount)
          if (next.index !== last.index || next.step !== last.step) {
            last = next
            setStage(next)
          }
        }
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [projectCount, locale])

  // 레일 스크롤스파이 + 흐름 섹션 리빌 (IntersectionObserver)
  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const spy = new IntersectionObserver(
      (entries) => {
        setActive((current) =>
          pickActiveSection(
            current,
            entries.flatMap((en) => {
              const id = (en.target as HTMLElement).dataset.section
              return isSectionId(id) ? [{ id, isIntersecting: en.isIntersecting }] : []
            })
          )
        )
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    root.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => spy.observe(el))

    let reveal: IntersectionObserver | null = null
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('pf-js')
      reveal = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            if (!en.isIntersecting) continue
            en.target.classList.add('is-in')
            reveal?.unobserve(en.target)
          }
        },
        { threshold: 0.1 }
      )
      root.querySelectorAll('.pf-reveal').forEach((el) => reveal?.observe(el))
    }
    return () => {
      spy.disconnect()
      reveal?.disconnect()
    }
  }, [locale])

  const goToProject = (index: number) => {
    const section = document.getElementById(WORK_ID)
    if (!section) return
    const vh = window.innerHeight || 720
    const top = projectScrollTop(
      section.getBoundingClientRect().top + window.scrollY,
      section.offsetHeight,
      vh,
      index,
      projectCount
    )
    window.scrollTo({ top, behavior: reduceRef.current ? 'auto' : 'smooth' })
  }

  const resumeHref = getResumeHref(locale)
  const otherHref = getResumeHref(locale === 'ko' ? 'en' : 'ko')
  const wordCount = c.hero.words.length + 2

  return (
    <div ref={rootRef} className="pf-root">
      <div className="pf-progress" aria-hidden="true" />

      <nav className="pf-rail" aria-label={c.rail.aria}>
        {PORTFOLIO_SECTION_IDS.map((id) => (
          <a
            key={id}
            href={`#pf-${id}`}
            aria-label={c.rail[id]}
            aria-current={active === id ? 'true' : undefined}
            className={active === id ? 'is-on' : undefined}
          >
            <span />
          </a>
        ))}
      </nav>

      {/* 1. 히어로 — 스크롤 단어 리빌 */}
      <section
        id="pf-top"
        data-section="top"
        data-pin="top"
        className="pf-pin"
        style={{ height: pinHeight('top') }}
      >
        <div className="pf-stage">
          <div className="pf-hero">
            <div className="pf-hero-id">
              <span className="pf-name">{c.hero.name}</span>
              <span className="pf-hero-role">{c.hero.role}</span>
              <span className="pf-mono pf-faint">{c.hero.career}</span>
            </div>
            <p className="pf-words" style={{ '--n': wordCount } as React.CSSProperties}>
              {c.hero.words.map((word, i) => (
                <span
                  key={`${i}-${word}`}
                  className={`pf-w${i === c.hero.accentWord ? ' is-accent' : ''}`}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {word}
                </span>
              ))}
            </p>
            <div className="pf-now">
              <a href={resumeHref} download className="pf-btn is-primary">
                {c.hero.pdf}
              </a>
              <button type="button" onClick={toggle} className="pf-btn" aria-label={locale === 'ko' ? 'Switch to English' : '한국어로 전환'}>
                {locale === 'ko' ? 'EN' : 'KO'}
              </button>
              <span className="pf-links pf-mono">
                {c.hero.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noreferrer' : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              </span>
            </div>
          </div>
          <span className="pf-hint">{c.hero.hint}</span>
        </div>
      </section>

      {/* 2. 핵심 성과 — 카드 5장 + 카운터 */}
      <section
        id="pf-kpi"
        data-section="kpi"
        data-pin="kpi"
        className="pf-pin is-panel"
        style={{ height: pinHeight('kpi') }}
      >
        <div className="pf-stage">
          <div className="pf-split">
            <div className="pf-split-head">
              <p className="pf-eyebrow">{c.kpi.eyebrow}</p>
              <h2 className="pf-h2">{c.kpi.headline}</h2>
              <span className="pf-note">{c.kpi.note}</span>
            </div>
            <div className="pf-kpis">
              {c.kpi.items.map((item, i) => {
                const visual = KPI_VISUALS[i] ?? { kind: 'check' }
                return (
                  <div key={item.title} className="pf-kpi" style={{ '--i': i } as React.CSSProperties}>
                    <div>
                      <div className="pf-kpi-t">{item.title}</div>
                      <div className="pf-kpi-d">{item.description}</div>
                    </div>
                    {visual.kind === 'bars' && (
                      <div className="pf-kpi-vis">
                        <div className="pf-kpi-big" data-counter={i}>
                          {formatCounter(visual.from, visual.decimals, visual.unit)}
                        </div>
                        <div className="pf-bars" aria-hidden="true">
                          {visual.bars.map((h, j) => (
                            <i key={j} style={{ '--j': j, '--h': `${h}%` } as React.CSSProperties} />
                          ))}
                        </div>
                        <div className="pf-bars-lbl" aria-hidden="true">
                          {visual.labels.map((l) => (
                            <span key={l}>{l}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {visual.kind === 'line' && (
                      <div className="pf-kpi-vis">
                        <div className="pf-kpi-big" data-counter={i}>
                          {formatCounter(visual.from, visual.decimals, visual.unit)}
                        </div>
                        <div className="pf-gauge" aria-hidden="true">
                          <b data-gauge={i} style={{ width: '100%' }} />
                        </div>
                      </div>
                    )}
                    {visual.kind === 'check' && (
                      <span className="pf-ok" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <span className="pf-hint">{c.kpi.hint}</span>
        </div>
      </section>

      {/* 3. 경력 — 선이 그려지며 역할 등장 */}
      <section
        id="pf-career"
        data-section="career"
        data-pin="career"
        className="pf-pin"
        style={{ height: pinHeight('career') }}
      >
        <div className="pf-stage">
          <div className="pf-split is-top">
            <div className="pf-split-head">
              <p className="pf-eyebrow">{c.career.eyebrow}</p>
              <h2 className="pf-h2">{c.career.headline}</h2>
              <span className="pf-note">{c.career.note}</span>
            </div>
            <div className="pf-roles">
              <svg
                viewBox="0 0 2 100"
                preserveAspectRatio="none"
                className="pf-wire-svg"
                aria-hidden="true"
              >
                <path className="pf-wire" pathLength={1} d="M1 0 V 100" />
              </svg>
              {c.career.roles.map((role, i) => (
                <div key={role.company} className="pf-role" style={{ '--i': i } as React.CSSProperties}>
                  <span className="pf-role-dot" />
                  <span className={`pf-badge is-b${i + 1}`}>{role.badge}</span>
                  <div className="pf-role-body">
                    <div className="pf-role-head">
                      <span className="pf-role-co">{role.company}</span>
                      <span className={`pf-mono ${role.current ? 'pf-accent' : 'pf-faint'}`}>{role.term}</span>
                    </div>
                    <span className="pf-note">{role.summary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. 주요 프로젝트 — 6건 × 문제·판단·실행·결과 */}
      <section
        id={WORK_ID}
        data-section="work"
        data-pin="work"
        className="pf-pin is-panel"
        style={{ height: pinHeight('work') }}
      >
        <div className="pf-stage is-work">
          <div className="pf-split is-top">
            <div className="pf-split-head is-wide">
              <p className="pf-eyebrow">{c.work.eyebrow}</p>
              <h2 className="pf-h2">{c.work.headline}</h2>
              <span className="pf-mono pf-faint pf-pidx">
                {String(stage.index + 1).padStart(2, '0')} / {String(projectCount).padStart(2, '0')}
              </span>
              <div className="pf-plist">
                {c.work.items.map((item, i) => (
                  <button
                    key={item.short}
                    type="button"
                    onClick={() => goToProject(i)}
                    className={stage.index === i ? 'is-on' : undefined}
                    aria-current={stage.index === i ? 'true' : undefined}
                  >
                    <span className="pf-plist-n">{String(i + 1).padStart(2, '0')}</span>
                    <span>{item.short}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="pf-projs">
              {c.work.items.map((item, i) => {
                const on = stage.index === i
                const played = on ? stage.step : 0
                return (
                  <article key={item.title} className={`pf-proj${on ? ' is-on' : ''}`} aria-hidden={!on}>
                    <div className="pf-proj-head">
                      <h3>{item.title}</h3>
                      <span className="pf-mono pf-accent">{item.meta}</span>
                    </div>
                    <div className="pf-segs" aria-hidden="true">
                      {c.work.stepLabels.map((label, s) => (
                        <span key={label} className={`pf-seg${s <= played ? ' is-on' : ''}`}>
                          <i />
                          {label}
                        </span>
                      ))}
                    </div>
                    {item.steps.map((text, s) => (
                      <div
                        key={s}
                        className={`pf-step${s <= played ? ' is-on' : ''}${s === item.steps.length - 1 ? ' is-last' : ''}`}
                      >
                        <span className="pf-step-k">{c.work.stepLabels[s]}</span>
                        <p className="pf-step-v">{text}</p>
                      </div>
                    ))}
                  </article>
                )
              })}
            </div>
          </div>
          <span className="pf-hint">{c.work.hint}</span>
        </div>
      </section>

      {/* 5. 보유 스킬 */}
      <section id="pf-skills" data-section="skills" className="pf-flow">
        <div className="pf-reveal pf-sec-head">
          <p className="pf-eyebrow">{c.skills.eyebrow}</p>
          <h2 className="pf-h2">{c.skills.headline}</h2>
        </div>
        <div className="pf-sgs">
          {c.skills.groups.map((group) => (
            <div key={group.label} className="pf-sg pf-reveal">
              <span className="pf-sg-l">{group.label}</span>
              <div className="pf-chips">
                {group.items.map((skill) => (
                  <span key={skill} className={`pf-chip${group.hot ? ' is-hot' : ''}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. 표준 수립 · 구조 개선 */}
      <section id="pf-standards" data-section="standards" className="pf-flow">
        <div className="pf-cols">
          {[c.standards, c.improvements].map((block) => (
            <div key={block.eyebrow} className="pf-col">
              <div className="pf-reveal pf-sec-head">
                <p className="pf-eyebrow">{block.eyebrow}</p>
                <h2 className="pf-h2 is-sm">{block.headline}</h2>
              </div>
              <div className="pf-lis">
                {block.items.map((item) => (
                  <div key={item.title} className="pf-li pf-reveal">
                    <span className="pf-li-t">{item.title}</span>
                    <span className="pf-li-d">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. 활동·문서화 + 학력 + PDF */}
      <section id="pf-more" data-section="more" className="pf-flow">
        <div className="pf-cols">
          <div className="pf-col">
            <div className="pf-reveal pf-sec-head">
              <p className="pf-eyebrow">{c.activities.eyebrow}</p>
              <h2 className="pf-h2 is-sm">{c.activities.headline}</h2>
            </div>
            <div className="pf-lis">
              {c.activities.items.map((item) => (
                <div key={item.title} className="pf-li pf-reveal">
                  <span className="pf-li-t">{item.title}</span>
                  <span className="pf-li-d">{item.description}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pf-col">
            <div className="pf-reveal pf-sec-head">
              <p className="pf-eyebrow">{c.education.eyebrow}</p>
              <h2 className="pf-h2 is-sm">{c.education.headline}</h2>
            </div>
            <div className="pf-lis">
              <div className="pf-li pf-reveal is-row">
                <span className="pf-badge is-b2 is-sm">{c.education.badge}</span>
                <div className="pf-li-body">
                  <span className="pf-li-t">{c.education.degree}</span>
                  <span className="pf-mono pf-faint">{c.education.term}</span>
                </div>
              </div>
            </div>
            <div className="pf-card pf-reveal">
              <span className="pf-card-t">{c.pdf.title}</span>
              <span className="pf-note">{c.pdf.description}</span>
              <div className="pf-card-actions">
                <a href={resumeHref} download className="pf-btn is-primary">
                  {locale === 'ko' ? c.pdf.ko : c.pdf.en}
                </a>
                <a href={otherHref} download className="pf-btn">
                  {locale === 'ko' ? c.pdf.en : c.pdf.ko}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 컨택트 */}
      <div className="pf-contact pf-reveal">
        <div className="pf-contact-body">
          <span className="pf-contact-h">{c.contact.headline}</span>
          <a href={`mailto:${c.contact.email}`} className="pf-contact-mail">
            {c.contact.email}
          </a>
        </div>
        <a href="#pf-top" className="pf-btn">
          {c.contact.top}
        </a>
      </div>
    </div>
  )
}
