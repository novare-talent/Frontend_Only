import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'
import { updatePassword } from '@/app/actions/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        action={updatePassword}
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
              />
            </div>

            <Button className="w-full">Update Password</Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            <Button asChild variant="link" className="px-2">
              <Link href="/login">Back to Login</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}