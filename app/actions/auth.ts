'use server'

import { AuthService } from './services/auth.service'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await AuthService.sendPasswordResetEmail(email, `${origin}/auth/update-password`)

  if (error) {
    console.error('Reset password error:', error)
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
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
  
  console.log('User check:', { user: user?.id, userError })

  if (userError || !user) {
    console.error('User authentication error:', userError)
    redirect(`/auth/update-password?error=${encodeURIComponent(userError?.message || 'Not authenticated. Please use the link from your email.')}`)
  }

  const { data, error } = await AuthService.updateUserPassword(password)

  console.log('Update password result:', { data: data?.user?.id, error })

  if (error) {
    console.error('Update password error:', error)
    redirect(`/auth/update-password?error=${encodeURIComponent(error.message)}`)
  }

  await AuthService.signOut()

  redirect('/sign-in?success=Password updated successfully. Please log in with your new password.')
}