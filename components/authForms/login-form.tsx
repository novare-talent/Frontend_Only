"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [userInput, setUserInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isSigHire, setIsSigHire] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    setIsSigHire(redirect?.includes("sig-hire") || false);
  }, [searchParams]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserInput({ ...userInput, [name]: value })
    
    if (name === 'email') {
      setIsEmailValid(validateEmail(value))
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: userInput.email,
      password: userInput.password,
    });

    if (error) {
      toast.error("Error", { description: error.message });
      setLoading(false);
      return;
    }

    // ✅ Get the user's role after login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Error", { description: "Unable to retrieve user." });
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      toast.error("Error", { description: "User profile not found." });
      return;
    }

    // Check for redirect parameter
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get("redirect");

    if (redirect) {
      router.push(redirect);
      toast.success("Login successful!");
      return;
    }

    // 🧭 Redirect based on role
    if (profile.role === "client") {
      router.push("/client");
    } else if (profile.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/Dashboard");
    }

    toast.success("Login successful!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("bg-muted overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]", className)}
      {...props}
    >
      <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
        <div>
          <Link href={isSigHire ? "/sig-hire" : "/"} aria-label="go home">
            {isSigHire ? (
              <span className="text-2xl font-extrabold gradient-text">SigHyre</span>
            ) : (
              <>
                <Image
                  src="/logoDark.svg"
                  alt="Logo"
                  width={160}
                  height={40}
                  className="block dark:hidden"
                />
                <Image
                  src="/logo.svg"
                  alt="Logo Dark"
                  width={160}
                  height={40}
                  className="hidden dark:block"
                />
              </>
            )}
          </Link>
          <h1 className="mb-1 mt-4 text-xl font-semibold text-foreground">Login to your account</h1>
          <p className="text-sm text-muted-foreground">Enter your email below to login to your account</p>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="block text-sm text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="roll_number@iit.ac.in or work@company.com"
              required
              value={userInput.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="block text-sm text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="********"
              required
              value={userInput.password}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !isEmailValid || !userInput.password}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Forgot Your Password?{" "}
            <Link href="/forgot-password" className="underline underline-offset-4 text-foreground hover:text-primary">
              Reset
            </Link>
          </div>

          {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div> */}
        </div>
      </div>

      <div className="p-3">
        <p className="text-accent-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Button asChild variant="link" className="px-2">
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </p>
        <div className="text-center mt-2 text-sm text-muted-foreground">
          By clicking continue, you agree to our <Link href="/Terms&Conditions.pdf" className="underline underline-offset-4">Terms of Service</Link>{" "}
          and <Link href="/Refund&CreditPolicy.pdf" className="underline underline-offset-4">Refund Policy</Link>.
        </div>
      </div>
    </form>
  );
}