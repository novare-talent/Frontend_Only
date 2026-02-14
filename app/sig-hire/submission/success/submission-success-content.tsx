"use client"

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function SigHireSubmissionSuccessContent() {
  const searchParams = useSearchParams();

  return (
    <Card className="max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-green-600">Submission Received!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div>
          <p className="text-foreground font-semibold mb-2">Your assignment has been submitted successfully.</p>
          <p className="text-sm text-muted-foreground">
            The evaluators will review your code and provide feedback shortly.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <p className="text-sm font-semibold text-blue-900 mb-2">What happens next?</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Your code will be automatically analyzed</li>
            <li>✓ Syntax and plagiarism checks will be performed</li>
            <li>✓ AI evaluation will assess your solution</li>
            <li>✓ A detailed report will be generated</li>
          </ul>
        </div>

        <Button
          onClick={() => window.location.href = "/"}
          className="w-full"
          size="lg"
        >
          Return Home
        </Button>
      </CardContent>
    </Card>
  );
}
