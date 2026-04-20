"use client";

import GlowButton from "@/components/landing/ui/GlowButton";
import { DotPattern } from "@/components/landing/ui/dot-pattern";
import { useRouter } from "next/navigation";
import { getUserRole, getDashboardPathByRole } from "@/utils/getUserRole";

export default function FinalCTA() {
  const router = useRouter();

  const handleCTAClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (session) {
      // User is logged in - get their role and route accordingly
      const role = await getUserRole();
      const dashboardPath = getDashboardPathByRole(role);
      router.push(dashboardPath);
    } else {
      // User not logged in - go to sign up
      router.push(path);
    }
  };

  return (
    <section id="cta" className="relative overflow-hidden border border-white/10 bg-black/80 backdrop-blur-sm rounded-md mx-auto max-w-6xl m-8" style={{background: 'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.6) 0%, transparent 70%)'}} >
      <DotPattern
        width={20}
        height={20}
        cr={0.8}
        className="text-violet-400/30 mask-[radial-gradient(ellipse_at_center,white_30%,transparent_80%)]"
      />
      <div className="relative z-10 flex flex-col items-center justify-center gap-10 py-16 px-4">
        <h2 className="text-white text-4xl md:text-7xl font-extrabold tracking-tight max-w-xs md:max-w-xl text-center">
          Ready to hire{" "}
          <br />
          <span className="gradient-text">Top 1% talent</span>?
        </h2>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/sign-up?role=recruiter"
              onClick={(e) => handleCTAClick(e, "/sign-up?role=recruiter")}
              className="inline-block"
            >
              <GlowButton className="text-base">
                Hire Top 1% Talent
              </GlowButton>
            </a>
            <a
              href="/sign-up"
              onClick={(e) => handleCTAClick(e, "/sign-up")}
              className="inline-block"
            >
              <GlowButton variant="secondary" className="text-base">
                Get Hired
              </GlowButton>
            </a>
          </div>
          <p className="text-white/80 text-sm text-center max-w-lg">
            Join the network of companies building the future with{" "}
            <span className="font-semibold text-white">India&apos;s best minds</span>
          </p>
        </div>
      </div>
    </section>
  );
}
