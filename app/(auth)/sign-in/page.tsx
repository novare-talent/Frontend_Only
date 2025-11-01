import { LoginForm } from "@/components/authForms/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Image
        src="/BackgroundAuth.jpg"
        alt="Background"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}