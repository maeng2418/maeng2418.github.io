// 포트폴리오 콘텐츠 데이터 모델 — REQ-BLOG-006
// 콘텐츠 SSOT: src/locales/{ko,en}/portfolio.json (design.md §4.5 — 실제 이력서 PDF 기반)

export interface PortfolioContact {
  label: string
  value: string
  href: string
  external?: boolean
}

export interface PortfolioValue {
  title: string
  description: string
}

export interface SkillGroup {
  label: string
  skills: string[]
  /** 승인 시안의 hot 칩 (액센트 강조) */
  highlights?: string[]
}

export interface PortfolioProject {
  title: string
  kind: string
  term: string
  description: string
  attribution: string
  tags: string[]
  link?: string
  github?: string
}

export interface TimestampItem {
  when: string
  title: string
  organizer: string
  current?: boolean
}

export interface ExperienceItem {
  company: string
  term: string
  description: string
  keyProjects: string[]
  achievements: string[]
  techStack: string[]
}

export interface EducationItem {
  term: string
  title: string
  description: string
}

export interface PortfolioContent {
  title: string
  businessCard: {
    title: string
    name: string
    role: string
    tagline: string
    career: string
    summary: string[]
    contacts: PortfolioContact[]
  }
  introduction: {
    title: string
    headline: string
    lead: string
    values: PortfolioValue[]
  }
  techSkill: { title: string; description: string; details: string[] }
  softSkill: { title: string; details: string[] }
  designSkill: { title: string; details: string[] }
  skillSets: { title: string; headline: string; groups: SkillGroup[] }
  projects: { title: string; headline: string; items: PortfolioProject[] }
  timestamp: {
    title: string
    headline: string
    /** current 항목 배지 라벨 (ko "재직중" / en "NOW") — REQ-BLOG-007 로케일 SSOT */
    currentBadge: string
    items: TimestampItem[]
  }
  experiences: {
    title: string
    headline: string
    /** 성과 펼침 토글 라벨 — REQ-BLOG-007 로케일 SSOT */
    viewAchievements: string
    items: ExperienceItem[]
  }
  educations: { title: string; items: EducationItem[] }
  contact: { title: string; headline: string; description: string }
  actions: {
    /** 우상단 고정 다운로드 버튼 라벨 */
    download: string
    /** 컨택트 장면 — 현재 로케일 이력서 다운로드 라벨 */
    downloadPrimary: string
    /** 컨택트 장면 — 반대 로케일 이력서 다운로드 라벨 */
    downloadOther: string
    /** 번역 토글 버튼 라벨 (전환될 대상 로케일 표기) */
    translate: string
    /** 번역 토글 접근성 라벨 */
    translateAria: string
  }
}
