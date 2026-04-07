"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      if (pathname === "/sig-hire") {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/sign-in?redirect=" + encodeURIComponent(pathname));
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "client") {
        router.replace("/client-signup");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#0a0118" }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid rgba(124,58,237,0.3)",
          borderTopColor: "#7c3aed",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  return <>{children}</>;
}
