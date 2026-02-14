"use client"

import { CheckCircle } from "lucide-react";

export default function SubmissionSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-green-600">Done!</h1>
        <p className="text-lg text-slate-700 max-w-md">
          Your assignment has been submitted successfully. The evaluators will review your code and provide feedback shortly.
        </p>
      </div>
    </div>
  );
}
