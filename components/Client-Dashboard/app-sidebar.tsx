"use client";

import * as React from "react";
import {
  IconDashboard, IconCreditCard
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
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Image
                  src="/LogoDark.png"
                  alt="Logo"
                  width={160}
                  height={40}
                  className="block dark:hidden"
                />
                {/* Dark Mode Logo */}
                <Image
                  src="/Logo.png"
                  alt="Logo Dark"
                  width={160}
                  height={40}
                  className="hidden dark:block"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} pathname={pathname} /> {/* Pass pathname */}
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}