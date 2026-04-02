// nav-main.tsx
"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  pathname,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon | any;
    external?: boolean;
    gradient?: boolean;
    badge?: string;
  }[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      {/* <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 mb-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-5 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Apply For Jobs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url;
          const isExternal = item.external;
          const hasGradient = item.gradient;

          if (isExternal) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  className={hasGradient ? "bg-gradient-to-r from-blue-500/80 via-purple-500/80 to-pink-500/80 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white hover:text-white active:bg-gradient-to-r active:from-blue-700 active:via-purple-700 active:to-pink-700 active:text-white" : ""}
                >
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    {item.icon && <item.icon />}
                    <span>{item.title}{item.badge ? <sup className="text-xs ml-1">{item.badge}</sup> : ""}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.url} className="cursor-pointer">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}