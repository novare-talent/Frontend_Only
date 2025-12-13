"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* LEFT CONTENT */}
        <div className="space-y-6">
          <h1 className="text-6xl font-bold tracking-tight">
            4<span className="relative -top-2 inline-block text-purple-600">0</span>4
          </h1>
          <h2 className="text-2xl font-semibold">Ooops! Page Not Found</h2>

          <p className="text-muted-foreground max-w-md">
            This page doesn’t exist or was removed. We suggest you go back to
            home.
          </p>

          <Button
            variant="outline"
            className="font-mono"
            onClick={() => router.push("https://www.novaretalent.com/")}
          >
            ← Back to Home
          </Button>
        </div>

        {/* RIGHT ILLUSTRATION */}
        <div className="flex justify-center">
          <Image
            src="/404-robot2.png"
            alt="404 Robot"
            width={520}
            height={420}
            priority
            className="select-none"
          />
        </div>
      </div>
    </div>
  );
}
