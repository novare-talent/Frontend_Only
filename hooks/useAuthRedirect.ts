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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const redirect = searchParams.get("redirect");
        if (redirect) {
          router.push(redirect);
        } else {
          router.push("/Dashboard");
        }
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, searchParams]);

  return isChecking;
}
