"use client";

import React, { ReactNode } from "react";
import { AppSidebar } from "@/components/Client-Dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/Client-Dashboard/site-header";


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