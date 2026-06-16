import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ── Protected routes — require login ──────────────────────────────
const PROTECTED_ROUTES = [
  '/dashboard',
  '/chart',
  '/paper-trading',
  '/live-trading',
  '/algo-builder',
  '/backtest',
  '/portfolio',
  '/emotion-report',
  '/leaderboard',
  '/learn',
  '/journal',
  '/settings',
  '/connect-broker',
]

// ── Auth routes — redirect to dashboard if already logged in ──────
const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/onboarding',
]

// ── Public routes — always accessible ────────────────────────────
const PUBLIC_ROUTES = [
  '/',
  '/terms',
  '/privacy',
  '/risk-disclaimer',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Get Firebase session token from cookie ────────────────────
  const token = request.cookies.get('zerionx1-session')?.value

  // ── Check if route is protected ───────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // ── Check if route is auth page ───────────────────────────────
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // ── No token + protected route → redirect to login ────────────
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Has token + auth route → redirect to dashboard ────────────
  if (isAuthRoute && token && pathname !== '/onboarding') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}
