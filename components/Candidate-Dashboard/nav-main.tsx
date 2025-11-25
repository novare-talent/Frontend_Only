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
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.url}>
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