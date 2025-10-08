import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // Shared "next" redirect param
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  // 🔹 Case 1: GitHub (or any OAuth) callback
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // if error → fall through to error redirect below
  }

  // 🔹 Case 2: Email OTP callback
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      redirect(next);
    }
    // if error → fall through to error redirect below
  }

  // 🔹 Case 3: Fallback (invalid or failed auth)
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
