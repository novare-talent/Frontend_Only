'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState, use } from 'react'

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const [emailError, setEmailError] = useState('')
  const params = use(searchParams)

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get('email') as string
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }
    setEmailError('')
    await resetPassword(formData)
  }

  return (
    <div className="relative min-h-screen w-full">
      
      {/* Fixed Background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/BackgroundAuth.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <form
            action={handleSubmit}
            className="bg-muted overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
            <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
              <div>
                <Link href="/" aria-label="go home">
                  <Image
                    src="/logoDark.svg"
                    alt="Logo"
                    width={160}
                    height={40}
                    className="block dark:hidden"
                  />
                  <Image
                    src="/logo.svg"
                    alt="Logo Dark"
                    width={160}
                    height={40}
                    className="hidden dark:block"
                  />
                </Link>
                <h1 className="mb-1 mt-4 text-xl font-semibold text-foreground">Recover Password</h1>
                <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
              </div>

              {params.error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription className="break-words">{decodeURIComponent(params.error)}</AlertDescription>
                </Alert>
              )}

              {params.success && (
                <Alert className="mt-4 border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
                  <AlertDescription>{params.success}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="block text-sm text-foreground">
                    Email
                  </Label>
                  <Input
                    type="email"
                    required
                    name="email"
                    id="email"
                    placeholder="roll_number@iit.ac.in or work@company.com"
                    onChange={(e) => {
                      if (emailError && validateEmail(e.target.value)) {
                        setEmailError('')
                      }
                    }}
                  />
                  {emailError && (
                    <p className="text-sm text-red-600 mt-1">{emailError}</p>
                  )}
                </div>

                <Button className="w-full">Send Reset Link</Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  We&apos;ll send you a link to reset your password.
                </p>
              </div>
            </div>

            <div className="p-3">
              <p className="text-accent-foreground text-center text-sm">
                Remembered your password?
                <Button asChild variant="link" className="px-2">
                  <Link href="/sign-in">Log in</Link>
                </Button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}