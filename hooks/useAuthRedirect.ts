"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { safeRedirectPath } from "@/lib/safe-redirect";

// The sign-in/sign-up pages render nothing but a spinner while this check is in
// flight, so a hanging or failing Supabase call must not leave it pending
// forever — on any error or past this budget we show the form and let the user
// try to log in.
const AUTH_CHECK_TIMEOUT_MS = 5000;

export function useAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const result = await Promise.race([
          supabase.auth.getUser(),
          new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), AUTH_CHECK_TIMEOUT_MS)
          ),
        ]);

        if (cancelled) return;

        const user = result?.data?.user ?? null;
        if (!result) {
          console.warn("[useAuthRedirect] auth check timed out — showing form");
        }

        if (user) {
          const redirect = searchParams.get("redirect");
          router.push(safeRedirectPath(redirect, "/Dashboard"));
          return;
        }
      } catch (error) {
        console.error("[useAuthRedirect] auth check failed — showing form:", error);
      }

      if (!cancelled) setIsChecking(false);
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return isChecking;
}
