// 인증 게이트 1계층 — SPEC-MAENGV2-EDITOR-MERGE-006 M4 (design.md §B D1/D6)
// `pageExtensions` 분기(next.config.ts)로 서버 타깃에서만 미들웨어로 인식된다(next@15.5.21 실측, design.md §B D1).
// 정적 타깃은 미들웨어를 지원하지 않으므로(빌드 실패) 이 성질이 필수다.
// 폴백(F-D1): 이 파일이 배포 어댑터에서 미들웨어로 인식되지 않으면, 각 route.server.ts의
// requireEditorAuth() 2계층 가드만으로도 인증이 성립한다(design.md §B D1 F-D1).
import { NextResponse, type NextRequest } from 'next/server'
import { requireEditorAuth } from '@/lib/editor-server/auth'

// _next/static 등 정적 자산은 인증·헤더 부여 대상에서 제외(R10 오버헤드 최소화).
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

// 로그인 화면 자체와 세션 발급 엔드포인트는 공개다 — 그렇지 않으면 로그인 리다이렉트 루프가 발생한다.
function requiresAuthGate(pathname: string, method: string): boolean {
  if (pathname === '/editor/login') return false
  if (pathname === '/api/auth/session' && method === 'POST') return false
  return pathname.startsWith('/editor') || pathname.startsWith('/api')
}

// R10 — workers.dev 서버 타깃 응답 전체에 중복 색인 방지 헤더를 부여한다(공개 블로그 라우트 포함).
function withNoIndexHeader(response: Response): Response {
  response.headers.set('X-Robots-Tag', 'noindex')
  return response
}

export async function middleware(request: NextRequest): Promise<Response> {
  const { pathname } = request.nextUrl

  if (!requiresAuthGate(pathname, request.method)) {
    return withNoIndexHeader(NextResponse.next())
  }

  const denied = await requireEditorAuth(request)
  if (denied) return withNoIndexHeader(denied)
  return withNoIndexHeader(NextResponse.next())
}
