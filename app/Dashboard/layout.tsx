"use client";

import React, { ReactNode } from "react";
import { AppSidebar } from "@/components/Candidate-Dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/Candidate-Dashboard/site-header";

// Auth and role are enforced in middleware (utils/supabase/middleware.ts) before
// this layout is ever rendered: an unauthenticated request is redirected to
// /sign-in and a non-"user" role is redirected to its own dashboard. The client
// side used to repeat that same getUser() + profiles lookup behind a full-screen
// spinner, which cost two more round trips on every navigation and left the page
// spinning forever whenever either call stalled. Rendering straight away removes
// the duplicate work without weakening the check.
const Layout = ({ children }: { children: ReactNode }) => {
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
