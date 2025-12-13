"use client";

import * as React from "react";
import {
  IconDashboard, IconCreditCard, IconSparkles
} from "@tabler/icons-react";

import { NavMain } from "@/components/Client-Dashboard/nav-main";
import { NavUser } from "@/components/Client-Dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Add this import

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);

  const pathname = usePathname(); // Add this

  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || "Client",
          email: session.user.email || "Client@gmail.com",
          avatar: session.user.user_metadata?.avatar_url || "/avatars/shadcn.jpg",
        });
      }
    };

    fetchUser();
  }, []);

  const navMain = [
    {
      title: "Dashboard",
      url: "/client",
      icon: IconDashboard,
    },
    {
      title: "Billing",
      url: "/client/billing",
      icon: IconCreditCard,
    },
    {
      title: "Try Sig Hire",
      url: "/sig-hire/uploads",
      icon: IconSparkles,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className="h-8"
            >
              <Link href="/">
                <Image
                  src="/LogoDark.png"
                  alt="Logo"
                  width={140}
                  height={32}
                  className="block dark:hidden ml-2"
                />
                {/* Dark Mode Logo */}
                <Image
                  src="/Logo.png"
                  alt="Logo Dark"
                  width={140}
                  height={32}
                  className="hidden dark:block ml-2"
                />
              </Link>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} pathname={pathname} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}