"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TextQuestionProps {
  title: string;
  name: string;
}

export function TextQuestion({ title, name }: TextQuestionProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{title}</Label>
      <Input id={name} name={name} placeholder={title} className="w-full" />
    </div>
  );
}
