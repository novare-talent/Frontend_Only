"use client"

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react"
import { usePathname } from 'next/navigation'
// nav-main.tsx
"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { IconCirclePlusFilled } from "@tabler/icons-react";

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
  const pathname = usePathname()
  
  const isActivePath = (itemUrl: string) => {
    // Remove trailing slashes from both paths for comparison
    const cleanItemUrl = itemUrl.replace(/\/$/, '')
    const cleanPathname = pathname.replace(/\/$/, '')
    return cleanPathname === cleanItemUrl
  }
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (            <SidebarMenuItem key={item.title}>
              <a href={item.url} about={item.title}>
              <SidebarMenuButton 
                tooltip={item.title}
                className={`hover:bg-purple-100 hover:text-purple-600 ${
                  isActivePath(item.url) ? 'bg-purple-100 text-purple-600' : ''
                }`}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
      <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 mb-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-5 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Apply For Jobs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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