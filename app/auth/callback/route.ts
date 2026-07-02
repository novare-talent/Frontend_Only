import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Build the success redirect response first.
  // Cookies are wired to write directly onto this response so they survive the redirect.
  const successResponse = NextResponse.redirect(
    new URL(next.startsWith('/') ? next : '/', origin)
  )

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            successResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // PKCE code exchange (when @supabase/ssr generates a code_challenge)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return successResponse
    console.error('Code exchange error:', error)
  }

  // Token-hash OTP (implicit flow — used by our reset email)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) return successResponse
    console.error('verifyOtp error:', error)
  }

  return NextResponse.redirect(
    new URL('/auth/update-password?error=Invalid+or+expired+reset+link', origin)
  )
}
