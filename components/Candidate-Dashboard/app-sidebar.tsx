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
      title: "My Applications",
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
            <div className="h-8 w-full flex items-center">
              <Link href="/" className="w-full">
                <Image
                  src="/logoDark.svg"
                  alt="Logo"
                  width={140}
                  height={32}
                  className="block dark:hidden ml-2 mt-2"
                />
                <Image
                  src="/logo.svg"
                  alt="Logo Dark"
                  width={140}
                  height={32}
                  className="hidden dark:block ml-2 mt-2"
                />
              </Link>
            </div>
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