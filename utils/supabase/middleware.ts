import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Always get user first
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 🚫 If the path starts with "/dashboard" (invalid route), redirect to "/"
  if (path.toLowerCase().startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  // PUBLIC routes that don't require login
  const publicPaths = ['/', '/sign-in', '/sign-up', '/error']
  const isPublic = publicPaths.some((p) => path.startsWith(p))

  // 🔒 If not signed in and not on a public path → redirect to sign-in
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  // 🧭 Client Routes
  if (path.startsWith('/client')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/sign-in'
      return NextResponse.redirect(url)
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !profile || profile.role !== 'client') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // 🧠 Admin-only routes
  if (path.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/sign-in'
      return NextResponse.redirect(url)
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !profile || profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
