import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const { data: { user } } = await supabase.auth.getUser();

  // 🔒 If not signed in → redirect to sign-in
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // Role-gated sections — one profile query covers all three route sections
  const needsRoleCheck = path.startsWith("/Dashboard") || path.startsWith("/client") || path.startsWith("/admin");
  if (needsRoleCheck) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

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
