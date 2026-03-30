"use client";

import { Suspense } from "react";
import { SectionCards } from "@/components/Sig-Hire/upload-cards";

function UploadContent() {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8 lg:pt-28">
        <SectionCards />
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <UploadContent />
    </Suspense>
  );
}
