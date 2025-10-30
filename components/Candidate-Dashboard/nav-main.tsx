// nav-main.tsx
"use client";
// NavMain component for Candidate Dashboard navigation
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { IconCirclePlusFilled } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon | any;
  }[];
}) {
  return (
    <SidebarGroup>
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
       
      </SidebarGroup>
  );
}
