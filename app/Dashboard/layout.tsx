"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { AppSidebar } from "@/components/Candidate-Dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/Candidate-Dashboard/site-header";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const Layout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/sign-in");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          router.replace("/sign-in");
          return;
        }

        if (profile?.role === "admin") {
          router.replace("/admin");
        } else if (profile?.role === "client") {
          router.replace("/client");
        } else if (profile?.role === "user") {
          setReady(true);
        } else {
          router.replace("/sign-in");
        }
      } catch (error) {
        console.error("Role check error:", error);
        router.replace("/sign-in");
      }
    };

    checkRole();
  }, [router]);

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
