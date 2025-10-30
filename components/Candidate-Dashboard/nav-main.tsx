"use client";

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
  const pathname = usePathname();

  const isActivePath = (itemUrl: string) => {
    const cleanItemUrl = itemUrl.replace(/\/$/, "");
    const cleanPathname = pathname.replace(/\/$/, "");
    return cleanPathname === cleanItemUrl;
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Main navigation links */}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`hover:bg-purple-100 hover:text-purple-600 ${
                  isActivePath(item.url)
                    ? "bg-purple-100 text-purple-600"
                    : ""
                }`}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {/* Quick Create / Apply for Jobs button */}
          <SidebarMenuItem className="flex items-center gap-2 mt-4">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-5 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Apply For Jobs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
