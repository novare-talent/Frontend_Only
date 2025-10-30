import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        action={resetPassword}
        className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div>
            <Link href="/" aria-label="go home">
              <Image
                src="/LogoDark.png"
                alt="Logo"
                width={160}
                height={40}
                className="block dark:hidden"
              />
              <Image
                src="/Logo.png"
                alt="Logo Dark"
                width={160}
                height={40}
                className="hidden dark:block"
              />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Recover Password</h1>
            <p className="text-sm">Enter your email to receive a reset link</p>
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
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                placeholder="name@example.com"
              />
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
              <Link href="/login">Log in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}