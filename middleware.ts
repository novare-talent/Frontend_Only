import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { applyRateLimit, limiters } from '@/utils/rateLimit'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // Auth-route brute-force: 5 req / 15 min per IP
  if (path.startsWith('/sign-in') || path.startsWith('/sign-up') || path.startsWith('/auth/')) {
    const limited = await applyRateLimit(limiters.authIp, `auth:${ip}`);
    if (limited) return limited;
  }

  // Global API guard: 120 req / min per IP
  if (path.startsWith('/api/')) {
    const limited = await applyRateLimit(limiters.globalIp, `api:${ip}`);
    if (limited) return limited;
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public routes (/, /sign-in, /sign-up, /iit-placements, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
