"use client";

import * as React from "react";
import {
  IconDashboard, IconCreditCard, IconSparkles, IconHelp
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

// --- DRIVER.JS IMPORTS ---
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);

  const pathname = usePathname(); 
  const router = useRouter(); 

  // --- AUTO-START FIRST TIME TOUR LOGIC ---
  React.useEffect(() => {
    // Check if the user has seen the tour for this specific path
    const tourKey = `hasSeenTour_${pathname}`;
    const hasSeenTour = localStorage.getItem(tourKey);

    // Only auto-trigger for the three main pages we have tours for
    const validTourPages = ["/client", "/client/create-job", "/client/billing"];

    if (!hasSeenTour && validTourPages.includes(pathname)) {
      // Small delay to ensure the page layout is fully painted
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

  // --- CONTEXT-AWARE TOUR LOGIC ---
  const runTour = () => {
    // 1. TOUR FOR THE "CREATE JOB" PAGE
    if (pathname === "/client/create-job") {
      const formDriver = driver({
        showProgress: true,
        steps: [
          {
            element: '#tour-job-details',
            popover: {
              title: 'Step 1: Create Job Form',
              description: 'Fill in the core details of the role, including the stipend, location, and a detailed description.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#tour-question-builder',
            popover: {
              title: 'Step 2: Create Form',
              description: 'Build your screening questionnaire here. You can add text answers, multiple choice, or use AI to generate questions automatically!',
              side: "top",
              align: 'start'
            }
          },
          {
            element: '#tour-form-preview',
            popover: {
              title: 'Step 3: Form Preview',
              description: 'This is exactly what the candidates will see. Use this to ensure your screening process is clear and professional.',
              side: "top",
              align: 'start'
            }
          },
          {
            element: '#tour-final-submit',
            popover: {
              title: 'Ready to Publish?',
              description: 'Once everything looks good, click here to post the job and start receiving AI-ranked applications.',
              side: "top",
              align: 'end'
            }
          }
        ]
      });
      formDriver.drive();
      return;
    }

    // 2. TOUR FOR THE BILLING PAGE
    if (pathname === "/client/billing") {
      const billingDriver = driver({
        showProgress: true,
        steps: [
          {
            element: '#jobs-remaining-card',
            popover: {
              title: 'Job Credits',
              description: 'This shows exactly how many job postings you have left in your current balance.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#add-credits-btn',
            popover: {
              title: 'Add More Credits',
              description: 'Click here to top up your account so you can post more jobs or run more candidate evaluations.',
              side: "left",
              align: 'center'
            }
          }
        ]
      });
      billingDriver.drive();
      return;
    }

    // 3. DEFAULT DASHBOARD TOUR (triggered for /client)
    const dashboardDriver = driver({
      showProgress: true, 
      allowClose: true,   
      steps: [
        { 
          popover: { 
            title: 'Welcome to Zenhyre!', 
            description: 'Let us give you a quick tour of your dashboard. You can skip this anytime by clicking the X or pressing Escape.',
            align: 'center'
          } 
        },
        {
          element: '#tour-dashboard', 
          popover: { 
            title: 'Your Dashboard', 
            description: 'This is your home base. Here you can view all the jobs you have created and monitor active postings.',
            side: "right",
            align: 'start' 
          }
        },
        {
          element: '#tour-billing', 
          popover: { 
            title: 'Billing & Subscriptions', 
            description: 'Manage your account plan, payment methods, and view your invoices here.',
            side: "right",
            align: 'start' 
          }
        },
        // {
        //   element: '#tour-try-sighyre', 
        //   popover: { 
        //     title: 'Try SigHyre AI', 
        //     description: 'Test out our powerful AI candidate ranking system before applying it to your live jobs.',
        //     side: "right",
        //     align: 'start' 
        //   }
        // },
        {
          element: '#create-job-btn', 
          popover: { 
            title: 'Create Your First Job', 
            description: 'Ready to start hiring? Click here to generate your job posting and set up the AI screening questionnaire.',
            side: "bottom",
            align: 'end' 
          }
        }
      ]
    });
    
    dashboardDriver.drive();
  };

  const handleStartTour = () => {
    // Manual trigger via button
    if (pathname === "/client" || pathname === "/client/create-job" || pathname === "/client/billing") {
      setTimeout(() => {
        runTour();
      }, 100);
    } else {
      router.push("/client");
      setTimeout(() => {
        runTour();
      }, 600); 
    }
  };

  const navMain = [
    {
      title: "Dashboard",
      url: "/client",
      icon: IconDashboard,
      id: "tour-dashboard", 
    },
    {
      title: "Billing",
      url: "/client/billing",
      icon: IconCreditCard,
      id: "tour-billing", 
    },
    // {
    //   title: "Try Sig Hyre",
    //   url: "/sig-hire/home",
    //   icon: IconSparkles,
    //   id: "tour-try-sighyre", 
    // },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="h-8 w-full flex items-center">
              <Link href="/" className="w-full">
                <Image
                  src="/LogoDark.png"
                  alt="Logo"
                  width={140}
                  height={32}
                  className="block dark:hidden ml-2 mt-2"
                />
                <Image
                  src="/Logo.png"
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
        
        <div className="mt-auto px-4 pb-4">
          <button 
            onClick={handleStartTour}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
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