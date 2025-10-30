'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  // Get the origin for the redirect URL
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/update-password`,
  })

  if (error) {
    console.error('Reset password error:', error)
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/forgot-password?success=Check your email for the reset link')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm-password') as string

  // Validate passwords match
  if (password !== confirmPassword) {
    redirect('/auth/update-password?error=Passwords do not match')
  }

  // Validate password length
  if (password.length < 6) {
    redirect('/auth/update-password?error=Password must be at least 6 characters')
  }

  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  console.log('User check:', { user: user?.id, userError })

  if (userError || !user) {
    console.error('User authentication error:', userError)
    redirect(`/auth/update-password?error=${encodeURIComponent(userError?.message || 'Not authenticated. Please use the link from your email.')}`)
  }

  // Update password
  const { data, error } = await supabase.auth.updateUser({
    password: password,
  })

  console.log('Update password result:', { data: data?.user?.id, error })

  if (error) {
    console.error('Update password error:', error)
    redirect(`/auth/update-password?error=${encodeURIComponent(error.message)}`)
  }

  // Sign out from all other sessions
  await supabase.auth.signOut()

  redirect('/sign-in?success=Password updated successfully. Please log in with your new password.')
}