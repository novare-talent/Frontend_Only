"use client";

import React, { ReactNode, useEffect } from "react";
import { AppSidebar } from "@/components/Admin-Dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/Admin-Dashboard/site-header";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const Layout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/sign-in");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Only allow 'admin' role on this dashboard
        if (profile?.role !== "admin") {
          if (profile?.role === "client") {
            router.push("/client");
          } else if (profile?.role === "user") {
            router.push("/Dashboard");
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Role check error:", error);
        router.push("/");
      }
    };

    checkRole();
  }, [router]);

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