"use client";

import * as React from "react";
import {
  IconDashboard,
  IconFileDescription,
  IconListDetails,
} from "@tabler/icons-react";

import { NavMain } from "@/components/Candidate-Dashboard/nav-main";
import { NavUser } from "@/components/Candidate-Dashboard/nav-user";
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
import { usePathname } from "next/navigation";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/Dashboard",
      icon: IconDashboard,
    },
    {
      title: "Applied Jobs",
      url: "/Dashboard/Jobs",
      icon: IconFileDescription,
    },
    {
      title: "Training",
      url: "/Dashboard/Training",
      icon: IconListDetails,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<any>(null);
  const pathname = usePathname(); // Add this

  React.useEffect(() => {
    const supabase = createClient();

    async function fetchUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, profile_image')
          .eq('id', session.user.id)
          .single();

        if (profile && !error) {
          // Combine first_name and last_name to form full name
          const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "User";
          
          setUser({
            name: fullName,
            email: profile.email || session.user.email,
            avatar: profile.profile_image,
          });
        } else {
          // Fallback to metadata if profile not found
          setUser({
            name: session.user.user_metadata?.full_name || "User",
            email: session.user.email,
            avatar: session.user.user_metadata?.avatar_url || "/avatars/default.jpg",
          });
        }
      }
    }

    fetchUser();
  }, []);

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
        <NavMain items={data.navMain} pathname={pathname} /> {/* Pass pathname */}
      </SidebarContent>

      <SidebarFooter suppressHydrationWarning>
        <NavUser
          user={
            user || {
              name: "Loading...",
              email: "",
              avatar: "/avatars/default.jpg",
            }
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}