'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'
import { updatePassword } from '@/app/actions/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState, use, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = use(searchParams)
  const [passwordError, setPasswordError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/sign-in?error=Session expired. Please request a new password reset link.')
          return
        }
        
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/sign-in?error=Authentication failed. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  const handleSubmit = async (formData: FormData) => {
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm-password') as string

    // Client-side validation
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    
    setPasswordError('')
    await updatePassword(formData)
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full">
        <div className="fixed inset-0 -z-10">
          <Image
            src="/BackgroundAuth.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Verifying session...</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render the form if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
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
                <h1 className="mb-1 mt-4 text-xl font-semibold">Reset Password</h1>
                <p className="text-sm">Enter your new password below</p>
              </div>

              {params.error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription className="break-words text-sm">
                    {decodeURIComponent(params.error)}
                  </AlertDescription>
                </Alert>
              )}

              {passwordError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription className="text-sm">
                    {passwordError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="block text-sm">
                    New Password
                  </Label>
                  <Input
                    type="password"
                    required
                    name="password"
                    id="password"
                    placeholder="Enter your new password"
                    minLength={6}
                    onChange={() => passwordError && setPasswordError('')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="block text-sm">
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    required
                    name="confirm-password"
                    id="confirm-password"
                    placeholder="Confirm your new password"
                    minLength={6}
                    onChange={() => passwordError && setPasswordError('')}
                  />
                </div>

                <Button className="w-full">Update Password</Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  After updating, you&apos;ll need to sign in with your new password.
                </p>
              </div>
            </div>

            <div className="p-3">
              <p className="text-accent-foreground text-center text-sm">
                Need a new reset link?{" "}
                <Button asChild variant="link" className="px-2">
                  <Link href="/forgot-password">Request Reset</Link>
                </Button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}