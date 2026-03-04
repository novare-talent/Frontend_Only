"use client";

import { Suspense } from "react";

function InsightsContent() {
  return (
    <div>Insights</div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <InsightsContent />
    </Suspense>
  );
}