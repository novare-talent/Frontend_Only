"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AppSidebar } from "@/components/Candidate-Dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/Candidate-Dashboard/site-header";

const Layout = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/sign-in"); // Redirect to home if not signed in
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router, supabase]);

  if (loading) {
    return <div>Loading...</div>;
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
