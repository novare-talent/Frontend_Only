"use client";

import { SignUpForm } from "@/components/authForms/sign-User";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

function SignUpContent() {
  const isChecking = useAuthRedirect();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const defaultTab = role === "recruiter" ? "client" : "user";

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <SignUpForm defaultTab={defaultTab} />
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen w-full">
      
      {/* Fixed Background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/BackgroundAuth.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Scrollable Content */}
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
        <SignUpContent />
      </Suspense>
      
    </div>
  );
}