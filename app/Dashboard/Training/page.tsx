"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrainingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/career-navigator-blogs");
  }, [router]);
  return null;
}
