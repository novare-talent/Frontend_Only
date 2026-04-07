"use client";

import { LoginForm } from "@/components/authForms/login-form";
import Image from "next/image";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Suspense } from "react";

function LoginContent() {
  const isChecking = useAuthRedirect();

  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
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
      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <LoginContent />
      </Suspense>
      
    </div>
  );
}