"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RadioQuestionProps {
  title: string;
  name: string;
  options: string[];
}

export function RadioQuestion({ title, name, options }: RadioQuestionProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label>{title}</Label>
      <RadioGroup name={name}>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <RadioGroupItem value={option} id={`${name}-${index}`} />
            <Label htmlFor={`${name}-${index}`}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
