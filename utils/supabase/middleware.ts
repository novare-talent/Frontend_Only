import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Simple in-memory cache (resets on server restart)
const sessionCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const path = request.nextUrl.pathname;

  // PUBLIC routes that don't require login - skip auth check entirely
  const publicPaths = [
    "/",
    "/sign-in",
    "/sign-up",
    "/error",
    "/forgot-password",
    "/auth/update-password",
    "/auth/callback",
    "/iit-placements",
  ];
  
  if (publicPaths.some((p) => path.startsWith(p))) {
    return supabaseResponse; // Skip all auth checks for public routes
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get session token for caching
  const sessionToken = request.cookies.get('sb-access-token')?.value || 
                       request.cookies.get('sb-localhost-auth-token')?.value;
  const cached = sessionToken ? sessionCache.get(sessionToken) : null;
  
  let user;
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    user = cached.user;
  } else {
    const { data: { user: fetchedUser } } = await supabase.auth.getUser();
    user = fetchedUser;
    if (sessionToken && user) {
      sessionCache.set(sessionToken, { user, timestamp: Date.now() });
    }
  }

  // 🔒 If not signed in → redirect to sign-in
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // 🧭 Dashboard Routes (for regular users)
  if (path.startsWith("/Dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Allow users with 'user' role to access dashboard
    if (error || !profile || profile.role !== "user") {
      // If not a regular user, redirect based on their actual role
      if (profile?.role === "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      } else if (profile?.role === "client") {
        const url = request.nextUrl.clone();
        url.pathname = "/client";
        return NextResponse.redirect(url);
      } else {
        // Unknown role or error - redirect to home
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  }

  // 🧭 Client Routes
  if (path.startsWith("/client")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile || profile.role !== "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // 🧠 Admin-only routes
  if (path.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
