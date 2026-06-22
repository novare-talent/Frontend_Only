"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function useAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const redirect = searchParams.get("redirect");
        router.push(redirect ?? "/Dashboard");
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, searchParams]);

  return isChecking;
}
