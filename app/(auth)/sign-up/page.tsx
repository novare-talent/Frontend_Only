"use client";

import { SignUpForm } from "@/components/authForms/sign-User";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const defaultTab = role === "recruiter" ? "client" : "user";

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
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <SignUpForm defaultTab={defaultTab} />
        </div>
      </div>
      
    </div>
  );
}