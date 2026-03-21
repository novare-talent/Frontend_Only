"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";

export default function CreateJobButtonServerChecked({ 
  text = "Create Job", 
  className 
}: { 
  text?: string; 
  className?: string; 
}) {
  const router = useRouter();

  function handleCreateJob() {
    router.push("/client/create-job");
  }

  return (
    <Button
      onClick={handleCreateJob}
      className={`${!className ? 'w-full' : 'w-auto'} flex ${className || ""}  cursor-pointer`}
    >
      <div className={`flex flex-row items-center gap-2 ${!className ? 'mr-36 pr-3' : ''}`}>
        <IconPlus className="w-5 h-5" />
        <span>{text}</span>
      </div>
    </Button>
  );
}