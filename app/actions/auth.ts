'use server'

import { AuthService } from './services/auth.service'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function resetPassword(formData: FormData) {
  const email = (formData.get('email') as string).trim().toLowerCase()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Validate the email exists in profiles
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  if (!profile) {
    redirect(`/forgot-password?error=${encodeURIComponent('No account found with this email. Please sign up first.')}`)
  }

  // Generate the recovery token via admin API.
  // We use hashed_token directly in our own URL so the user lands on
  // /auth/update-password with the token already in the query string.
  // This bypasses Supabase's redirect chain (and any PKCE code/verifier
  // complexity) entirely.
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: profile.email,
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error('generateLink error:', linkError)
    redirect(`/forgot-password?error=${encodeURIComponent('Failed to generate reset link. Please try again.')}`)
  }

  const resetUrl = `${origin}/auth/update-password?token_hash=${linkData.properties.hashed_token}&type=recovery`

  // Send the email ourselves via Resend
  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: profile.email,
    subject: 'Reset your Zenhyre password',
    html: `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;color:#1c1022;">
  <div style="background:#7f00e2;padding:28px 32px 24px;border-radius:10px 10px 0 0;">
    <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">ZENHYRE</div>
    <div style="font-size:12px;color:#d0a8f8;margin-top:4px;">Password Reset</div>
  </div>
  <div style="background:#fdfaff;padding:28px 32px;border:1px solid #e8ddf5;border-top:none;border-radius:0 0 10px 10px;">
    <p style="margin:0 0 16px;font-size:15px;">Hi,</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#5a4a6a;">
      We received a request to reset your password. Click the button below to choose a new one.
      This link expires in <strong>1 hour</strong>.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${resetUrl}"
         style="display:inline-block;background:#7f00e2;color:#ffffff;font-size:14px;font-weight:600;
                text-decoration:none;padding:12px 32px;border-radius:8px;">
        Reset Password
      </a>
    </div>
    <p style="margin:0 0 8px;font-size:12px;color:#9b8aaa;">
      If the button doesn't work, copy and paste this URL into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:11px;color:#7f00e2;word-break:break-all;">${resetUrl}</p>
    <p style="margin:0;font-size:12px;color:#9b8aaa;">
      If you didn't request a password reset, you can safely ignore this email.
    </p>
  </div>
  <p style="text-align:center;font-size:11px;color:#9b8aaa;margin:12px 0 0;">
    Zenhyre · Novare Talent
  </p>
</div>`,
  })

  if (sendError) {
    console.error('Resend error:', sendError)
    redirect(`/forgot-password?error=${encodeURIComponent('Failed to send email. Please try again.')}`)
  }

  redirect('/forgot-password?success=Check your email for the reset link')
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm-password') as string

  if (password !== confirmPassword) {
    redirect('/auth/update-password?error=Passwords do not match')
  }

  if (password.length < 6) {
    redirect('/auth/update-password?error=Password must be at least 6 characters')
  }

  const { data: { user }, error: userError } = await AuthService.getCurrentUser()

  if (userError || !user) {
    redirect(`/auth/update-password?error=${encodeURIComponent(userError?.message || 'Not authenticated. Please use the link from your email.')}`)
  }

  const { data, error } = await AuthService.updateUserPassword(password)

  if (error) {
    redirect(`/auth/update-password?error=${encodeURIComponent(error.message)}`)
  }

  await AuthService.signOut()

  redirect('/sign-in?success=Password updated successfully. Please log in with your new password.')
}
