// 포트폴리오 콘텐츠 데이터 모델 — 시안 v18 (D안 v2 문법 + portfolio_02 이력서)
// 콘텐츠 SSOT: messages/{ko,en}.json 의 portfolio 네임스페이스. 숫자·고유명사는 두 로케일이 동일하다.

export interface PortfolioLink {
  label: string
  href: string
  external?: boolean
}

/** 제목 + 설명 한 쌍 — 핵심 성과 / 표준 수립 / 구조 개선 / 활동 목록이 공유 */
export interface PortfolioItem {
  title: string
  description: string
}

export interface PortfolioRole {
  /** 타임라인 배지 약어 (NOL / IGA / 짐싸) */
  badge: string
  company: string
  term: string
  current?: boolean
  summary: string
}

export interface PortfolioProject {
  /** 왼쪽 목록용 짧은 제목 */
  short: string
  title: string
  meta: string
  /** 문제 → 판단 → 실행 → 결과 순서의 4단계 본문 */
  steps: string[]
}

export interface SkillGroup {
  label: string
  items: string[]
  /** 주력 칩 (잉크 배경 강조) */
  hot?: boolean
}

export interface PortfolioSection {
  eyebrow: string
  headline: string
}

export interface PortfolioContent {
  hero: {
    name: string
    role: string
    career: string
    /** 스크롤 단어 리빌 — 한 단어씩 밝아진다 */
    words: string[]
    /** 액센트 색으로 강조할 단어 인덱스 */
    accentWord: number
    pdf: string
    hint: string
    links: PortfolioLink[]
  }
  kpi: PortfolioSection & { note: string; hint: string; items: PortfolioItem[] }
  career: PortfolioSection & { note: string; roles: PortfolioRole[] }
  work: PortfolioSection & { hint: string; stepLabels: string[]; items: PortfolioProject[] }
  skills: PortfolioSection & { groups: SkillGroup[] }
  standards: PortfolioSection & { items: PortfolioItem[] }
  improvements: PortfolioSection & { items: PortfolioItem[] }
  activities: PortfolioSection & { items: PortfolioItem[] }
  education: PortfolioSection & { badge: string; degree: string; term: string }
  pdf: { title: string; description: string; ko: string; en: string }
  contact: { headline: string; email: string; top: string }
  rail: { aria: string } & Record<
    'top' | 'kpi' | 'career' | 'work' | 'skills' | 'standards' | 'more',
    string
  >
}
