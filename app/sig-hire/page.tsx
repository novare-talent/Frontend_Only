"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/components/Sig-Hire/loading-overlay";
import { useSession } from "@/context/SessionContext";
import { useMultiSession } from "@/context/MultiSessionContext";
import { initializeSession } from "@/lib/ranking-api";
import { createClient } from "@/utils/supabase/client";
import Footer from "@/components/landing/layout/Footer";
import { HeroSection } from "@/components/Sig-Hire/home/hero-section";
import { StatsTicker } from "@/components/Sig-Hire/home/stats-ticker";
import { FeaturesSection } from "@/components/Sig-Hire/home/features-section";
import { HowItWorksSection } from "@/components/Sig-Hire/home/how-it-works-section";
import { TestimonialsSection } from "@/components/Sig-Hire/home/testimonials-section";
import { CTASection } from "@/components/Sig-Hire/home/cta-section";

function HomePageContent() {
  const router = useRouter();
  const { setSessionId, setClientId, isLoading, setIsLoading, error, setError } = useSession();
  const { addSession, loadSessions, sessions } = useMultiSession();
  const [loadingMessage, setLoadingMessage] = useState("Initializing session...");

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await loadSessions(user.id);
    };
    loadUser();
  }, [loadSessions]);

  const handleStartHiring = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingMessage("Getting your profile...");

      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in to continue");

      setClientId(user.id);
      setLoadingMessage(`Profile ID: ${user.id}\nInitializing session...`);

      const sessionResponse = await initializeSession(user.id);
      if (!sessionResponse.session_id) throw new Error("Failed to create session");

      await addSession({
        session_id: sessionResponse.session_id,
        client_id: user.id,
        status: "initialized",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setSessionId(sessionResponse.session_id);
      setIsLoading(false);
      router.push(`/sig-hire/uploads?session_id=${sessionResponse.session_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize session. Please try again.");
      setIsLoading(false);
    }
  };

  const handleViewSessions = () => router.push("/sig-hire/sessions");

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#0a0118" }}>

      {/* Global styles */}
      <style>{`
        .gradient-border-card {
          position: relative;
          transition: all 0.3s ease;
        }
        .gradient-border-card::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .gradient-border-card:hover::before {
          background: linear-gradient(135deg, rgba(139,92,246,0.5), rgba(99,102,241,0.2));
        }
        .gradient-border-card:hover { transform: translateY(-2px); }

        @keyframes pulse-ring {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-inner { animation: ticker 30s linear infinite; }
        .ticker-inner:hover { animation-play-state: paused; }
      `}</style>

      <LoadingOverlay
        isVisible={isLoading}
        message={loadingMessage}
        error={error}
        onRetry={handleStartHiring}
      />

      <HeroSection
        onStartHiring={handleStartHiring}
        isLoading={isLoading}
        sessions={sessions ?? []}
        onViewSessions={handleViewSessions}
      />
      <StatsTicker />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#0a0118" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "2px solid rgba(124,58,237,0.3)",
          borderTopColor: "#7c3aed",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
