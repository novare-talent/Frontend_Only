import { LoginForm } from "@/components/authForms/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
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
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center mb-8">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/LoginPage.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
          width={800}
          height={800}
        />
      </div>
    </div>
  );
}