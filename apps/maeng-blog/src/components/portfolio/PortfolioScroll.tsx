'use client'

// 포트폴리오 스크롤 장면 — REQ-BLOG-006/007, design.md §4 (A안: 자산 불요 모션 온리)
// 승인 시안(.moai/reports/design/maeng-portfolio-preview.html)의 장면 구성을 이식:
//   Scene 1 인트로 메가 타이틀(스크롤 scale/fade) → Scene 2 소개 가치 카드 stagger
//   → Scene 3 스킬(테크/소프트/디자인 + 칩 stagger) → Scene 4 프로젝트 가로 레일 스크럽
//   → Scene 5 타임라인/경력/학력 → Scene 6 컨택트(로케일별 PDF 다운로드)
// 성능/접근성: transform/opacity 만 애니메이트, prefers-reduced-motion 시 전 모션 비활성
// (globals.css .pf-* 폴백 — 정적 레이아웃으로 콘텐츠 완전 표시)
import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_LOCALE,
  readStoredLocale,
  storeLocale,
  toggleLocale,
  type Locale,
} from '@/lib/i18n/locale'
import { getPortfolioContent, getResumeHref } from '@/lib/portfolio/content'

const STAGGER_STEP_MS = 70

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-bold tracking-[0.16em] uppercase text-accent">{children}</p>
  )
}

function SceneHeadline({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[clamp(28px,4.5vw,52px)] font-extrabold leading-[1.08] tracking-[-0.03em] text-balance">
      {children}
    </h2>
  )
}

export default function PortfolioScroll({ initialLocale = DEFAULT_LOCALE }: { initialLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  const rootRef = useRef<HTMLDivElement>(null)
  const introPinRef = useRef<HTMLDivElement>(null)
  const introTitleRef = useRef<HTMLHeadingElement>(null)
  const projPinRef = useRef<HTMLDivElement>(null)
  const railWrapRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const contactPinRef = useRef<HTMLDivElement>(null)
  const contactTitleRef = useRef<HTMLHeadingElement>(null)

  // localStorage 하이드레이션 — 렌더 중 접근 금지 (SSR/정적 export 안전, REQ-BLOG-007)
  useEffect(() => {
    setLocale(readStoredLocale(window.localStorage))
  }, [])

  const onToggleLocale = () => {
    setLocale((prev) => {
      const next = toggleLocale(prev)
      storeLocale(next, window.localStorage)
      return next
    })
  }

  // stagger 등장 (IntersectionObserver) — reduced-motion 시 지연 없이 즉시 표시
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const groups = root.querySelectorAll<HTMLElement>('[data-stagger-group]')

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const items = entry.target.querySelectorAll<HTMLElement>('.pf-stagger:not(.in)')
          items.forEach((el, i) => {
            el.style.transitionDelay = reduced ? '0ms' : `${i * STAGGER_STEP_MS}ms`
            el.classList.add('in')
          })
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.2 }
    )
    groups.forEach((group) => observer.observe(group))
    return () => observer.disconnect()
  }, [locale])

  // 스크롤 진행도 바인딩 — intro scale/fade · 프로젝트 레일 스크럽 · 컨택트 rise
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
    const pinProgress = (el: HTMLElement | null) => {
      if (!el) return 0
      const rect = el.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      return scrollable <= 0 ? 0 : clamp01(-rect.top / scrollable)
    }

    let raf = 0
    const apply = () => {
      raf = 0
      const introTitle = introTitleRef.current
      if (introTitle) {
        const p = pinProgress(introPinRef.current)
        introTitle.style.transform = `scale(${1 - p * 0.18}) translateY(${p * -40}px)`
        introTitle.style.opacity = String(1 - p * 0.85)
      }
      const rail = railRef.current
      const railWrap = railWrapRef.current
      if (rail && railWrap) {
        const p = pinProgress(projPinRef.current)
        const max = Math.max(0, rail.scrollWidth - railWrap.clientWidth)
        rail.style.transform = `translateX(${-p * max}px)`
      }
      const contactTitle = contactTitleRef.current
      if (contactTitle) {
        const p = pinProgress(contactPinRef.current)
        contactTitle.style.transform = `translateY(${(1 - p) * 60}px)`
        contactTitle.style.opacity = String(0.2 + p * 0.8)
      }
    }
    const onScroll = () => {
      if (raf === 0) raf = window.requestAnimationFrame(apply)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    apply()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf !== 0) window.cancelAnimationFrame(raf)
    }
  }, [])

  const c = getPortfolioContent(locale)
  const resumeHref = getResumeHref(locale)
  const otherResumeHref = getResumeHref(toggleLocale(locale))

  return (
    <div ref={rootRef}>
      {/* 우상단 고정 액션 — 다운로드 + 번역 토글 (레거시 배치 패리티, design.md §3.4) */}
      <div className="fixed top-20 right-5 z-40 flex gap-2 md:right-8">
        <a
          data-section="downloadButton"
          href={resumeHref}
          download
          className="rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-paper no-underline transition-opacity hover:opacity-90"
        >
          ⬇ {c.actions.download}
        </a>
        <button
          data-section="translateButton"
          type="button"
          onClick={onToggleLocale}
          aria-label={c.actions.translateAria}
          className="rounded-full border border-line bg-card px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
        >
          {c.actions.translate}
        </button>
      </div>

      {/* Scene 1 — 인트로 메가 타이틀 + 명함 (BusinessCard) */}
      <div ref={introPinRef} className="pf-pin">
        <section data-section="businessCard" className="pf-frame" aria-label={c.businessCard.title}>
          <div className="mx-auto max-w-[900px] text-center">
            <Eyebrow>{c.title}</Eyebrow>
            <h1
              ref={introTitleRef}
              className="pf-fx text-[clamp(40px,8vw,104px)] font-extrabold leading-[1.03] tracking-[-0.035em] text-balance"
            >
              {locale === 'ko' ? (
                <>
                  안녕하세요!
                  <br />
                  {c.businessCard.role},
                  <br />
                  <span className="text-accent">{c.businessCard.name}</span>입니다!
                </>
              ) : (
                <>
                  Hello!
                  <br />
                  I&apos;m <span className="text-accent">{c.businessCard.name}</span>,
                  <br />
                  {c.businessCard.role}!
                </>
              )}
            </h1>
            <p className="mx-auto mt-6 max-w-[62ch] text-[clamp(15px,2vw,19px)] text-ink-soft">
              {c.businessCard.tagline}
            </p>
            <p className="mt-2 text-[13px] font-semibold tracking-[0.08em] uppercase text-ink-faint">
              {c.businessCard.career}
            </p>
            <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {c.businessCard.contacts.map((contact) => (
                <li key={contact.label}>
                  <a
                    href={contact.href}
                    className="font-semibold text-ink-soft no-underline hover:text-accent"
                    {...(contact.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {contact.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Scene 2 — 소개 (Introduction values stagger) */}
      <section
        data-section="introduction"
        data-stagger-group
        className="border-t border-line px-2 py-24 md:py-28"
        aria-label={c.introduction.title}
      >
        <div className="mx-auto max-w-[900px] text-center">
          <Eyebrow>{c.introduction.title}</Eyebrow>
          <SceneHeadline>{c.introduction.headline}</SceneHeadline>
          <div className="mt-11 grid gap-4 text-left sm:grid-cols-2">
            {c.introduction.values.map((value) => (
              <div
                key={value.title}
                className="pf-stagger rounded-xl border border-line bg-card p-5"
              >
                <b className="mb-1.5 block text-[15px]">{value.title}</b>
                <p className="text-[13px] text-ink-soft">{value.description}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-[62ch] text-left text-sm text-ink-soft">
            {c.businessCard.summary.join(' ')}
          </p>
        </div>
      </section>

      {/* Scene 3 — 스킬 (Tech/Soft/Design + Skill Sets 칩 stagger) */}
      <section
        data-stagger-group
        className="border-t border-line px-2 py-24 md:py-28"
        aria-label={c.skillSets.title}
      >
        <div className="mx-auto max-w-[900px] text-center">
          <Eyebrow>{c.skillSets.title}</Eyebrow>
          <SceneHeadline>{c.skillSets.headline}</SceneHeadline>

          <div className="mt-11 grid gap-4 text-left md:grid-cols-3">
            <div data-section="techSkill" className="pf-stagger rounded-xl border border-line bg-card p-5">
              <b className="mb-2 block text-[15px]">{c.techSkill.title}</b>
              <ul className="list-disc space-y-1 pl-4 text-[13px] text-ink-soft">
                {c.techSkill.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
            <div data-section="softSkill" className="pf-stagger rounded-xl border border-line bg-card p-5">
              <b className="mb-2 block text-[15px]">{c.softSkill.title}</b>
              <ul className="list-disc space-y-1 pl-4 text-[13px] text-ink-soft">
                {c.softSkill.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
            <div data-section="designSkill" className="pf-stagger rounded-xl border border-line bg-card p-5">
              <b className="mb-2 block text-[15px]">{c.designSkill.title}</b>
              <ul className="list-disc space-y-1 pl-4 text-[13px] text-ink-soft">
                {c.designSkill.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>

          <div data-section="skillSets" className="mt-10">
            {c.skillSets.groups.map((group) => (
              <div key={group.label} className="mt-7">
                <span className="text-xs font-bold tracking-[0.12em] uppercase text-ink-faint">
                  {group.label}
                </span>
                <div className="mt-2.5 flex flex-wrap justify-center gap-2">
                  {group.skills.map((skill) => {
                    const hot = group.highlights?.includes(skill)
                    return (
                      <span
                        key={skill}
                        className={`pf-stagger rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
                          hot
                            ? 'bg-accent-soft text-accent'
                            : 'border border-line bg-card text-ink'
                        }`}
                      >
                        {skill}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scene 4 — 프로젝트 가로 레일 (스크롤 진행도 스크럽) */}
      <div ref={projPinRef} className="pf-pin">
        <section data-section="projects" className="pf-frame" aria-label={c.projects.title}>
          <div className="mx-auto w-full max-w-[1000px] text-center">
            <Eyebrow>{c.projects.title}</Eyebrow>
            <SceneHeadline>{c.projects.headline}</SceneHeadline>
            <div ref={railWrapRef} className="mt-10 w-full overflow-hidden">
              <div ref={railRef} className="pf-rail flex gap-5">
                {c.projects.items.map((project) => (
                  <article
                    key={project.title}
                    className="w-[320px] shrink-0 rounded-2xl border border-line bg-card p-6 text-left"
                  >
                    <p className="font-mono text-[11px] text-ink-faint">
                      {project.term} · {project.kind}
                    </p>
                    <h3 className="mt-1.5 text-[17px] leading-[1.35] font-bold">
                      {project.link ? (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink no-underline hover:text-accent"
                        >
                          {project.title} ↗
                        </a>
                      ) : (
                        project.title
                      )}
                    </h3>
                    <p className="mt-2 line-clamp-4 text-[13px] text-ink-soft">
                      {project.description}
                    </p>
                    <p className="mt-2 line-clamp-3 text-[12px] text-ink-faint">
                      {project.attribution}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-[12px] font-semibold text-accent no-underline hover:underline"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Scene 5 — 타임라인 (Timestamp) + 경력 (Experiences) + 학력 (Educations) */}
      <section
        data-section="timestamp"
        data-stagger-group
        className="border-t border-line px-2 py-24 md:py-28"
        aria-label={c.timestamp.title}
      >
        <div className="mx-auto max-w-[720px] text-center">
          <Eyebrow>{c.timestamp.title}</Eyebrow>
          <SceneHeadline>{c.timestamp.headline}</SceneHeadline>
          <ol className="mt-10 text-left">
            {c.timestamp.items.map((item) => (
              <li
                key={`${item.when}-${item.title}`}
                className="pf-stagger grid grid-cols-[112px_1fr] gap-4 border-b border-dashed border-line py-3.5 md:grid-cols-[150px_1fr]"
              >
                <span className="pt-0.5 font-mono text-[12px] text-ink-faint">{item.when}</span>
                <span>
                  <b className="text-[15px]">{item.title}</b>
                  {item.current && (
                    <span className="ml-2 inline-block rounded-full bg-accent px-2 py-0.5 align-[2px] text-[10px] font-bold text-paper">
                      {c.timestamp.currentBadge}
                    </span>
                  )}
                  <br />
                  <span className="text-[12px] text-ink-soft">{item.organizer}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        data-section="experiences"
        data-stagger-group
        className="border-t border-line px-2 py-24 md:py-28"
        aria-label={c.experiences.title}
      >
        <div className="mx-auto max-w-[900px] text-center">
          <Eyebrow>{c.experiences.title}</Eyebrow>
          <SceneHeadline>{c.experiences.headline}</SceneHeadline>
          <div className="mt-11 space-y-6 text-left">
            {c.experiences.items.map((experience) => (
              <article
                key={experience.company}
                className="pf-stagger rounded-2xl border border-line bg-card p-6 md:p-8"
              >
                <header className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-bold tracking-[-0.015em]">{experience.company}</h3>
                  <span className="font-mono text-[12px] text-ink-faint">{experience.term}</span>
                </header>
                <p className="mt-3 text-sm text-ink-soft">{experience.description}</p>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-[13px] text-ink-soft">
                  {experience.keyProjects.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <details className="mt-4 text-[13px] text-ink-soft">
                  <summary className="cursor-pointer font-semibold text-accent">
                    {c.experiences.viewAchievements}
                  </summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {experience.achievements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </details>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {experience.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-bold text-accent"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="educations"
        data-stagger-group
        className="border-t border-line px-2 py-24 md:py-28"
        aria-label={c.educations.title}
      >
        <div className="mx-auto max-w-[720px] text-center">
          <Eyebrow>{c.educations.title}</Eyebrow>
          <ol className="mt-8 text-left">
            {c.educations.items.map((education) => (
              <li
                key={education.title}
                className="pf-stagger grid grid-cols-[112px_1fr] gap-4 border-b border-dashed border-line py-3.5 md:grid-cols-[150px_1fr]"
              >
                <span className="pt-0.5 font-mono text-[12px] text-ink-faint">{education.term}</span>
                <span>
                  <b className="text-[15px]">{education.title}</b>
                  <br />
                  <span className="text-[12px] text-ink-soft">{education.description}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Scene 6 — 컨택트 (로케일별 PDF 다운로드, 액센트 대형 등장) */}
      <div ref={contactPinRef} className="pf-pin pf-pin-short">
        <section className="pf-frame" aria-label={c.contact.title}>
          <div className="mx-auto max-w-[900px] text-center">
            <Eyebrow>{c.contact.title}</Eyebrow>
            <h2
              ref={contactTitleRef}
              className="pf-fx text-[clamp(40px,7vw,88px)] font-extrabold leading-[1.05] tracking-[-0.035em]"
            >
              {locale === 'ko' ? (
                <>
                  <span className="text-accent">함께</span> 일해요.
                </>
              ) : (
                <>
                  Let&apos;s work <span className="text-accent">together</span>.
                </>
              )}
            </h2>
            <p className="mx-auto mt-5 max-w-[62ch] text-[15px] text-ink-soft">
              {c.contact.description}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href={resumeHref}
                download
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-bold text-paper no-underline transition-opacity hover:opacity-90"
              >
                ⬇ {c.actions.downloadPrimary}
              </a>
              <a
                href={otherResumeHref}
                download
                className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-7 py-3.5 text-[15px] font-bold text-ink no-underline transition-colors hover:border-accent hover:text-accent"
              >
                ⬇ {c.actions.downloadOther}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
