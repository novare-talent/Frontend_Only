import { SignUpForm } from "@/components/authForms/sign-User";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted pr-6 md:p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center">
          {/* Light Mode Logo */}
          <Image
            src="/LogoDark.png"
            alt="Logo"
            width={210}
            height={60}
            className="block dark:hidden"
          />
          {/* Dark Mode Logo */}
          <Image
            src="/Logo.png"
            alt="Logo Dark"
            width={210}
            height={60}
            className="hidden dark:block"
          />
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
