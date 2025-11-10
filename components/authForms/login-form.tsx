"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [userInput, setUserInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const { error, data } = await supabase.auth.signInWithPassword({
      email: userInput.email,
      password: userInput.password,
    });

    if (error) {
      toast.error("Error", { description: error.message });
      setLoading(false);
      return;
    }

    // ✅ Get the user’s role after login
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
    <div className="border-2 bg-white border-primary p-8 rounded-2xl shadow-2xl dark:bg-[#222327]">
      <form
        onSubmit={handleSubmit}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-start gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
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

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center text-sm">
            Forgot Your Password?{" "}
            <a href="/forgot-password" className="underline underline-offset-4">
              Reset
            </a>
          </div>

          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>
        </div>
      </form>

      <div className="text-center text-sm mt-2">
        Don&apos;t have an account?{" "}
        <a href="/sign-up" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
      <div className="px-6 text-center mt-4 text-sm text-muted-foreground">
        By clicking continue, you agree to our <a href="/Terms&Conditions.pdf" className="underline underline-offset-4">Terms of Service</a>{" "}
        and <a href="/Refund&CreditPolicy.pdf" className="underline underline-offset-4">Refund Policy</a>.
      </div>
    </div>
  );
}
