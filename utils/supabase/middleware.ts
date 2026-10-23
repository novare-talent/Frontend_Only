import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Budgets chosen to stay under the typical 10s platform gateway timeout even
// when both calls are made back to back.
const AUTH_TIMEOUT_MS = 6000;
const ROLE_TIMEOUT_MS = 6000;

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
    "/auth/confirm",
    "/iit-placements",
    "/career-blogs",
    "/submission",
  ];

  if (publicPaths.some((p) => path.startsWith(p))) {
    return supabaseResponse;
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

  // Every protected request pays for these Supabase calls. If one stalls we must
  // stop waiting well before the hosting platform's gateway gives up, otherwise
  // the request dies as a 504 and the browser just spins.
  const withTimeout = <T,>(promise: PromiseLike<T>, ms: number) =>
    Promise.race([
      promise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ]);

  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.redirect(url);
  };

  let userResult: Awaited<ReturnType<typeof supabase.auth.getUser>> | null = null;
  try {
    userResult = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS);
  } catch (error) {
    console.error("[middleware] auth check failed:", error);
  }

  // Auth could not be established (timeout or error) — fail closed, but send the
  // user somewhere that renders instead of letting the request hang.
  if (!userResult) {
    console.warn(`[middleware] auth check unavailable for ${path} — redirecting to sign-in`);
    return redirectTo("/sign-in");
  }

  const user = userResult.data?.user ?? null;

  // 🔒 If not signed in → redirect to sign-in
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // Role-gated sections — one profile query covers all three route sections
  const needsRoleCheck = path.startsWith("/Dashboard") || path.startsWith("/client") || path.startsWith("/admin");
  if (needsRoleCheck) {
    // TODO: expose `role` as a custom claim on the access token (Supabase custom
    // access token hook) so this section needs no database round trip at all.
    let profileResult: { data: { role?: string } | null } | null = null;
    try {
      profileResult = await withTimeout(
        supabase.from("profiles").select("role").eq("id", user.id).single(),
        ROLE_TIMEOUT_MS
      );
    } catch (error) {
      console.error("[middleware] role lookup failed:", error);
    }

    // Role unknown — fail closed rather than guessing, since guessing either
    // locks a legitimate user out of their dashboard or lets them into someone
    // else's.
    if (!profileResult) {
      console.warn(`[middleware] role lookup unavailable for ${path}`);
      return redirectTo("/error");
    }

    const role = profileResult.data?.role;

    if (path.startsWith("/Dashboard") && role !== "user") {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : role === "client" ? "/client" : "/";
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/client") && role !== "client") {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : role === "user" ? "/Dashboard" : "/sign-in";
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = role === "client" ? "/client" : role === "user" ? "/Dashboard" : "/sign-in";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
