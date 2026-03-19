"use client";

import * as React from "react";
import {
  IconDashboard, IconCreditCard, IconHelp
} from "@tabler/icons-react";

import { NavMain } from "@/components/Client-Dashboard/nav-main";
import { NavUser } from "@/components/Client-Dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { driver } from "driver.js";
// import "driver.js/dist/driver.css";
import "../../app/tour-styles.css";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const tourKey = `hasSeenTour_${pathname}`;
    const hasSeenTour = localStorage.getItem(tourKey);
    const validTourPages = ["/client", "/client/create-job", "/client/billing"];

    if (!hasSeenTour && validTourPages.includes(pathname)) {
      const timer = setTimeout(() => {
        runTour();
        localStorage.setItem(tourKey, "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
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

  

  const runTour = () => {
    if (pathname === "/client/create-job") {
      driver({
        showProgress: true,
        // FIXED: popoverClass scopes our styles and avoids conflicts
        popoverClass: "zenhyre-tour-popover",
        steps: [
          {
            element: "#tour-job-details",
            popover: {
              title: "Step 1 — Job Details",
              description:
                "Fill in the core details of the role: stipend, location, and a compelling description.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#tour-question-builder",
            popover: {
              title: "Step 2 — Screening Form",
              description:
                "Build your questionnaire with text answers, multiple choice, or let AI generate questions for you.",
              side: "top",
              align: "start",
            },
          },
          {
            element: "#tour-form-preview",
            popover: {
              title: "Step 3 — Live Preview",
              description:
                "See exactly what candidates see. Make sure your screening process is clear and professional.",
              side: "top",
              align: "start",
            },
          },
          {
            element: "#tour-final-submit",
            popover: {
              title: "Ready to Publish",
              description:
                "When everything looks good, post the job and start receiving AI-ranked applications.",
              side: "top",
              align: "end",
            },
          },
        ],
      }).drive();
      return;
    }

    if (pathname === "/client/billing") {
      driver({
        showProgress: true,
        popoverClass: "zenhyre-tour-popover",
        steps: [
          {
            element: "#jobs-remaining-card",
            popover: {
              title: "Your Job Credits",
              description:
                "This shows how many job postings remain in your current balance.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#add-credits-btn",
            popover: {
              title: "Top Up Credits",
              description:
                "Add more credits to post additional jobs or run more candidate evaluations.",
              side: "left",
              align: "center",
            },
          },
        ],
      }).drive();
      return;
    }

    // FIXED: Welcome step uses side: "over" so Driver.js centers it without
    // trying to anchor to a non-existent element (avoids off-screen placement)
    driver({
      showProgress: true,
      allowClose: true,
      popoverClass: "zenhyre-tour-popover",
      steps: [
        {
          popover: {
            title: "Welcome to Zenhyre",
            description:
              "Let's take 30 seconds to show you around. Press Escape anytime to skip.",
            side: "over",
            align: "center",
          },
        },
        {
          element: "#tour-dashboard",
          popover: {
            title: "Dashboard",
            description:
              "Your home base — view all created jobs and monitor active postings at a glance.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-billing",
          popover: {
            title: "Billing",
            description:
              "Manage your plan, payment methods, and view past invoices.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#create-job-btn",
          popover: {
            title: "Post Your First Job",
            description:
              "Create a job posting and configure AI-powered screening in minutes.",
            side: "bottom",
            align: "end",
          },
        },
      ],
    }).drive();
  };

  const handleStartTour = () => {
    if (["/client", "/client/create-job", "/client/billing"].includes(pathname)) {
      setTimeout(runTour, 100);
    } else {
      router.push("/client");
      setTimeout(runTour, 600);
    }
  };

  const navMain = [
    { title: "Dashboard", url: "/client", icon: IconDashboard, id: "tour-dashboard" },
    { title: "Billing", url: "/client/billing", icon: IconCreditCard, id: "tour-billing" },
  ];

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

      <SidebarContent className="flex flex-col h-full">
        <NavMain items={navMain} pathname={pathname} />
        

        <div className="mt-auto px-2 pb-4">
          <button
            onClick={handleStartTour}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
          >
            <IconHelp className="h-5 w-5" />
            <span>Guided Tour</span>
          </button>
        </div>
        
      </SidebarContent>

      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}