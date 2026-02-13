"use client";

import { Suspense } from "react";
import { SectionCards } from "@/components/Sig-Hire/upload-cards";

function UploadContent() {
  return <SectionCards />;
}

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Suspense fallback={<div>Loading...</div>}>
            <UploadContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}