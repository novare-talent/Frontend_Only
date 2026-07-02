import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const supabase = await createClient()

  // PKCE code exchange (used when resetPasswordForEmail is called server-side)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirect(next)
    }
  }

  // Token-hash OTP verification (used by email magic links / recovery)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    if (!error) {
      // redirect() from next/navigation (not NextResponse.redirect) ensures
      // session cookies set by verifyOtp are included in the response
      redirect(next)
    }
    console.error('Callback verification error:', error)
  }

  // Verification failed
  return NextResponse.redirect(
    new URL('/auth/update-password?error=Invalid or expired reset link', origin)
  )
}