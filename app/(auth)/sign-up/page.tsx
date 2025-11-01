import { SignUpForm } from "@/components/authForms/sign-User";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <Image
        src="/BackgroundAuth.jpg"
        alt="Background"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignUpForm />
      </div>
    </div>
  );
}
