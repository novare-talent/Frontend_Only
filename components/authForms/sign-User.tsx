"use client";

import type React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { Mail, Phone, EyeOff, Eye, Upload, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export function SignUpForm({
  className,
  defaultTab = "user",
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  defaultTab?: "user" | "client";
}) {
  const [signupType, setSignupType] = useState<"user" | "client">(defaultTab);

  const [userFormData, setUserFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    githubLink: "",
    linkedinLink: "",
    password: "",
  });

  const [clientFormData, setClientFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    password: "",
  });

  const [userErrors, setUserErrors] = useState({
    email: "",
  });

  const [clientErrors, setClientErrors] = useState({
    email: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const validateUserUrls = () => {
    const newErrors = {
      email: "",
    };

    // Email validation for users (IIT domains)
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@(ds\.study\.iitm\.ac\.in|smail\.iitm\.ac\.in|kgpian\.iitkgp\.ac\.in|iitkgp\.ac\.in|iitb\.ac\.in|iitm\.ac\.in|iitk\.ac\.in|iitd\.ac\.in|iitg\.ac\.in|iitr\.ac\.in|iitbhu\.ac\.in|iitrpr\.ac\.in|iitbbs\.ac\.in|iitgn\.ac\.in|iith\.ac\.in|iiti\.ac\.in|iitj\.ac\.in|iitp\.ac\.in|iitmandi\.ac\.in|iitpkd\.ac\.in|iittp\.ac\.in|iitism\.ac\.in|iitbhilai\.ac\.in|iitgoa\.ac\.in|iitjammu\.ac\.in|iitdharwad\.ac\.in|ce\.iitr\.ac\.in|me\.iitr\.ac\.in|mfs\.iitr\.ac\.in|ee\.iitr\.ac\.in|ece\.iitr\.ac\.in|cy\.iitr\.ac\.in|cs\.iitr\.ac\.in|mt\.iitr\.ac\.in|ph\.iitr\.ac\.in|pt\.iitr\.ac\.in|ma\.iitr\.ac\.in|hy\.iitr\.ac\.in|es\.iitr\.ac\.in|eq\.iitr\.ac\.in|ch\.iitr\.ac\.in)$/;

    if (!emailRegex.test(userFormData.email)) {
      newErrors.email = "Only IIT institutional emails are allowed";
    }

    setUserErrors(newErrors);
    return !newErrors.email;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateClientEmail = () => {
    const newErrors = {
      email: "",
    };

    // Basic email validation
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!basicEmailRegex.test(clientFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Block personal and IIT emails for clients
    const blockedEmailRegex = /@(gmail\.com|iit[a-z]*\.ac\.in|ce\.iitr\.ac\.in|me\.iitr\.ac\.in|mfs\.iitr\.ac\.in|ee\.iitr\.ac\.in|ece\.iitr\.ac\.in|cy\.iitr\.ac\.in|cs\.iitr\.ac\.in|mt\.iitr\.ac\.in|ph\.iitr\.ac\.in|pt\.iitr\.ac\.in|ma\.iitr\.ac\.in|hy\.iitr\.ac\.in|es\.iitr\.ac\.in|eq\.iitr\.ac\.in|ch\.iitr\.ac\.in|iitism\.ac\.in)$/i;
    if (blockedEmailRegex.test(clientFormData.email)) {
      newErrors.email = "Please use your official company email";
    }

    setClientErrors(newErrors);
    return !newErrors.email;
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailRegex =
  /^[a-zA-Z0-9._%+-]+@(ds\.study\.iitm\.ac\.in|smail\.iitm\.ac\.in|kgpian\.iitkgp\.ac\.in|iitkgp\.ac\.in|iitb\.ac\.in|iitm\.ac\.in|iitk\.ac\.in|iitd\.ac\.in|iitg\.ac\.in|iitr\.ac\.in|iitbhu\.ac\.in|iitrpr\.ac\.in|iitbbs\.ac\.in|iitgn\.ac\.in|iith\.ac\.in|iiti\.ac\.in|iitj\.ac\.in|iitp\.ac\.in|iitmandi\.ac\.in|iitpkd\.ac\.in|iittp\.ac\.in|iitism\.ac\.in|iitbhilai\.ac\.in|iitgoa\.ac\.in|iitjammu\.ac\.in|iitdharwad\.ac\.in|ce\.iitr\.ac\.in|me\.iitr\.ac\.in|mfs\.iitr\.ac\.in|ee\.iitr\.ac\.in|ece\.iitr\.ac\.in|cy\.iitr\.ac\.in|cs\.iitr\.ac\.in|mt\.iitr\.ac\.in|ph\.iitr\.ac\.in|pt\.iitr\.ac\.in|ma\.iitr\.ac\.in|hy\.iitr\.ac\.in|es\.iitr\.ac\.in|eq\.iitr\.ac\.in|ch\.iitr\.ac\.in)$/;

    if (!emailRegex.test(userFormData.email)) {
      toast.error("Invalid Email Domain", {
        description: "Only IIT institutional emails are allowed.",
        duration: 5000,
        position: "top-right",
      });
      setIsLoading(false);
      return;
    }

    if (!validateUserUrls()) {
      toast.error("Invalid URL", {
        description: "Please fix the URL errors before submitting.",
        duration: 5000,
        position: "top-right",
      });
      setIsLoading(false);
      return;
    }

    if (userFormData.password.length < 6) {
      toast.error("Password too short", {
        description: "Password must be at least 6 characters.",
        duration: 5000,
        position: "top-right",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userFormData.email,
        password: userFormData.password,
        options: {
          data: {
            first_name: userFormData.firstName,
            last_name: userFormData.lastName,
            role: "user",
          },
        },
      });

      if (signUpError) {
        let errorDescription = signUpError.message;
        let errorTitle = "Sign-up Failed";

        if (signUpError.status === 422) {
          errorTitle = "Invalid Data";
          errorDescription =
            "The provided data is invalid. Please check your email and password.";
        } else if (signUpError.status === 429) {
          errorTitle = "Too Many Requests";
          errorDescription =
            "Too many sign-up attempts. Please try again later.";
        } else if (signUpError.status === 500) {
          errorTitle = "Server Error";
          errorDescription =
            "Authentication service is temporarily unavailable.";
        } else if (
          signUpError.message?.includes("already registered") ||
          signUpError.message?.includes("user_exists")
        ) {
          errorTitle = "Email Already Registered";
          errorDescription =
            "This email is already registered. Please sign in instead.";
        }

        toast.error(errorTitle, {
          description: errorDescription,
          duration: 7000,
          position: "top-right",
        });

        setIsLoading(false);
        return;
      }

      const user = data?.user;

      if (!user) {
        toast.error("Sign-up Failed", {
          description: "No user account was created. Please try again.",
          duration: 5000,
          position: "top-right",
        });
        setIsLoading(false);
        return;
      }

      let profileImageUrl: string | null = null;
      if (profileImage) {
        try {
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("profile-images")
              .upload(`${user.id}/${profileImage.name}`, profileImage, {
                cacheControl: "3600",
                upsert: false,
              });

          if (uploadError) {
            toast.error("Profile Image Upload Failed", {
              description:
                "Your account was created but we couldn't upload your profile image. You can update it later.",
              duration: 5000,
              position: "top-right",
            });
          } else if (uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from("profile-images")
              .getPublicUrl(uploadData.path);

            profileImageUrl = publicUrlData.publicUrl;
          }
        } catch {
          // Silent failure for non-critical image upload errors
        }
      }

      let resumeUrl: string | null = null;
      if (resumeFile) {
        try {
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("resumes")
              .upload(`${user.id}/${Date.now()}_${resumeFile.name}`, resumeFile, {
                cacheControl: "3600",
                upsert: false,
              });

          if (uploadError) {
            toast.error("Resume Upload Failed", {
              description:
                "Your account was created but we couldn't upload your resume. You can update it later in your profile.",
              duration: 5000,
              position: "top-right",
            });
          } else if (uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from("resumes")
              .getPublicUrl(uploadData.path);

            resumeUrl = publicUrlData.publicUrl;
          }
        } catch {
          // Silent failure for non-critical resume upload errors
        }
      }

      const profileData = {
        id: user.id,
        email: userFormData.email,
        first_name: userFormData.firstName,
        last_name: userFormData.lastName,
        phone: userFormData.phone,
        github_link: userFormData.githubLink,
        linkedin_link: userFormData.linkedinLink,
        profile_image: profileImageUrl,
        resume_url: resumeUrl ? [resumeUrl] : [],
        role: "user",
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([profileData]);

      if (profileError) {
        toast.error("Profile Creation Failed", {
          description: `Account created but profile setup failed: ${profileError.message}`,
          duration: 7000,
          position: "top-right",
        });

        setIsLoading(false);
        return;
      }

      toast.success("Account Created Successfully!", {
        description: "Please check your email to confirm your account.",
        duration: 10000,
        position: "top-right",
      });

      setUserFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        githubLink: "",
        linkedinLink: "",
        password: "",
      });
      setProfileImage(null);
      setResumeFile(null);
    } catch (err) {
      toast.error("Unexpected Error", {
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : "Unknown error"}`,
        duration: 7000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!clientFormData.email || !clientFormData.email.includes("@")) {
      toast.error("Invalid Email", {
        description: "Please provide a valid email address.",
        duration: 5000,
        position: "top-right",
      });
      setIsLoading(false);
      return;
    }

    const blockedEmailRegex = /@(gmail\.com|iit[a-z]*\.ac\.in|ce\.iitr\.ac\.in|me\.iitr\.ac\.in|mfs\.iitr\.ac\.in|ee\.iitr\.ac\.in|ece\.iitr\.ac\.in|cy\.iitr\.ac\.in|cs\.iitr\.ac\.in|mt\.iitr\.ac\.in|ph\.iitr\.ac\.in|pt\.iitr\.ac\.in|ma\.iitr\.ac\.in|hy\.iitr\.ac\.in|es\.iitr\.ac\.in|eq\.iitr\.ac\.in|ch\.iitr\.ac\.in|iitism\.ac\.in)$/i;
    if (blockedEmailRegex.test(clientFormData.email)) {
      toast.error("Invalid Company Email", {
        description:
          "Please use your official company email — Gmail and IIT emails are not allowed for clients.",
        duration: 6000,
        position: "top-right",
      });
      setIsLoading(false);
      return;
    }

    if (clientFormData.password.length < 6) {
      toast.error("Password too short", {
        description: "Password must be at least 6 characters.",
        duration: 5000,
        position: "top-right",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: clientFormData.email,
        password: clientFormData.password,
        options: {
          data: {
            first_name: clientFormData.firstName,
            last_name: clientFormData.lastName,
            role: "client",
          },
        },
      });

      if (signUpError) {
        let errorDescription = signUpError.message;
        let errorTitle = "Sign-up Failed";

        if (
          signUpError.message?.includes("already registered") ||
          signUpError.message?.includes("user_exists")
        ) {
          errorTitle = "Email Already Registered";
          errorDescription =
            "This email is already registered. Please sign in instead.";
        }

        toast.error(errorTitle, {
          description: errorDescription,
          duration: 7000,
          position: "top-right",
        });

        setIsLoading(false);
        return;
      }

      const user = data?.user;

      if (!user) {
        toast.error("Sign-up Failed", {
          description: "No user account was created. Please try again.",
          duration: 5000,
          position: "top-right",
        });
        setIsLoading(false);
        return;
      }

      const profileData = {
        id: user.id,
        email: clientFormData.email,
        first_name: clientFormData.firstName,
        last_name: clientFormData.lastName,
        phone: clientFormData.phone,
        company_name: clientFormData.companyName,
        role: "client",
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([profileData]);

      if (profileError) {
        toast.error("Profile Creation Failed", {
          description: `Account created but profile setup failed: ${profileError.message}`,
          duration: 7000,
          position: "top-right",
        });

        setIsLoading(false);
        return;
      }

      toast.success("Client Account Created Successfully!", {
        description: "Please check your email to confirm your account.",
        duration: 10000,
        position: "top-right",
      });

      setClientFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyName: "",
        password: "",
      });
    } catch (err) {
      toast.error("Unexpected Error", {
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : "Unknown error"}`,
        duration: 7000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserFormData({ ...userFormData, [id]: value });

    // Clear errors when user starts typing
    if (userErrors.email && id === "email") {
      setUserErrors({ ...userErrors, email: "" });
    }
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setClientFormData({ ...clientFormData, [id]: value });

    // Clear email error when user starts typing
    if (clientErrors.email && id === "email") {
      setClientErrors({ ...clientErrors, email: "" });
    }
  };

  // Check if user form is valid
  const isUserFormValid = () => {
    return (
      userFormData.firstName &&
      userFormData.lastName &&
      userFormData.email &&
      userFormData.phone &&
      userFormData.linkedinLink &&
      userFormData.password &&
      userFormData.password.length >= 6
    );
  };

  // Check if client form is valid
  const isClientFormValid = () => {
    return (
      clientFormData.firstName &&
      clientFormData.lastName &&
      clientFormData.email &&
      clientFormData.phone &&
      clientFormData.companyName &&
      clientFormData.password &&
      clientFormData.password.length >= 6
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-muted overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)] mx-auto max-w-md w-full">
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div>
            <Link href="/" aria-label="go home">
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
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold text-foreground">Welcome Aboard</h1>
            <p className="text-sm text-muted-foreground">Create an Account to build your professional profile.</p>
          </div>
          <Tabs
            value={signupType}
            onValueChange={(value) => setSignupType(value as "user" | "client")}
            className="w-full mt-6"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">Candidate Sign Up</TabsTrigger>
              <TabsTrigger value="client">Client Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleUserSubmit}>
                {/* Profile Picture Upload */}
                {/* <div className="mb-6 flex flex-col items-center gap-2">
                  <Label htmlFor="profile-picture">Profile Picture (Optional)</Label>
                  <div className="relative group cursor-pointer" onClick={() => profileImageInputRef.current?.click()}>
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileImage ? URL.createObjectURL(profileImage) : undefined} />
                      <AvatarFallback>
                        <span className="text-3xl">
                          {userFormData.firstName?.[0]}
                          {userFormData.lastName?.[0]}
                        </span>
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <Input
                    ref={profileImageInputRef}
                    id="profile-picture"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                </div> */}

                {/* Fields */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="grid gap-2 mt-3">
                    <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      required
                      placeholder="First name"
                      value={userFormData.firstName}
                      onChange={handleUserChange}
                    />
                  </div>
                  <div className="grid gap-2 mt-3">
                    <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      required
                      placeholder="Last name"
                      value={userFormData.lastName}
                      onChange={handleUserChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      className={`pl-10 ${userErrors.email ? "border-red-500" : ""}`}
                      placeholder="@iit.ac.in or work@company.com"
                      value={userFormData.email}
                      onChange={handleUserChange}
                    />
                  </div>
                  {userErrors.email && (
                    <p className="text-sm text-red-500">
                      {userErrors.email}
                    </p>
                  )}
                </div>

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      required
                      className="pl-10"
                      placeholder="+91 83455 67890"
                      value={userFormData.phone}
                      onChange={handleUserChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={userFormData.password}
                      onChange={handleUserChange}
                      placeholder="Create a strong password (min. 6 characters)"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="githubLink" className="text-foreground">GitHub</Label>
                  <Input
                    id="githubLink"
                    type="url"
                    value={userFormData.githubLink}
                    onChange={handleUserChange}
                    placeholder="https://github.com/username (optional)"
                  />
                </div>

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="linkedinLink" className="text-foreground">LinkedIn</Label>
                  <Input
                    id="linkedinLink"
                    type="url"
                    required
                    value={userFormData.linkedinLink}
                    onChange={handleUserChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="grid gap-2 mt-3">
                  <Label className="text-foreground">Resume (Optional)</Label>
                  {resumeFile ? (
                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">{resumeFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setResumeFile(null)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files[0];
                        if (file && file.type === "application/pdf" && file.size <= 2 * 1024 * 1024) {
                          setResumeFile(file);
                        } else {
                          toast.error("Invalid File", {
                            description: "Please upload a PDF file under 2MB",
                          });
                        }
                      }}
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".pdf";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file && file.type === "application/pdf" && file.size <= 2 * 1024 * 1024) {
                            setResumeFile(file);
                          } else {
                            toast.error("Invalid File", {
                              description: "Please upload a PDF file under 2MB",
                            });
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload or drag & drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF (up to 2MB)</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">You can update your resume later in the profile section</p>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={isLoading || !isUserFormValid()}
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="client">
              <form onSubmit={handleClientSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="grid gap-2 mt-3">
                    <Label htmlFor="clientFirstName" className="text-foreground">First Name</Label>
                    <Input
                      id="clientFirstName"
                      type="text"
                      required
                      placeholder="First name"
                      value={clientFormData.firstName}
                      onChange={(e) =>
                        handleClientChange({
                          ...e,
                          target: { ...e.target, id: "firstName" },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                    />
                  </div>
                  <div className="grid gap-2 mt-3">
                    <Label htmlFor="clientLastName" className="text-foreground">Last Name</Label>
                    <Input
                      id="clientLastName"
                      type="text"
                      required
                      placeholder="Last name"
                      value={clientFormData.lastName}
                      onChange={(e) =>
                        handleClientChange({
                          ...e,
                          target: { ...e.target, id: "lastName" },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="clientEmail" className="text-foreground">Company Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="clientEmail"
                      type="email"
                      required
                      className={`pl-10 ${clientErrors.email ? "border-red-500" : ""}`}
                      placeholder="your@email.com"
                      value={clientFormData.email}
                      onChange={(e) =>
                        handleClientChange({
                          ...e,
                          target: { ...e.target, id: "email" },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                    />
                  </div>
                  {clientErrors.email && (
                    <p className="text-sm text-red-500">
                      {clientErrors.email}
                    </p>
                  )}
                </div>

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="clientPhone" className="text-foreground">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="clientPhone"
                      type="tel"
                      required
                      className="pl-10"
                      placeholder="+91 83455 67890"
                      value={clientFormData.phone}
                      onChange={(e) =>
                        handleClientChange({
                          ...e,
                          target: { ...e.target, id: "phone" },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="clientCompanyName" className="text-foreground">Company Name</Label>
                  <Input
                    id="clientCompanyName"
                    type="text"
                    required
                    placeholder="Your company name"
                    value={clientFormData.companyName}
                    onChange={(e) =>
                      handleClientChange({
                        ...e,
                        target: { ...e.target, id: "companyName" },
                      } as React.ChangeEvent<HTMLInputElement>)
                    }
                  />
                </div>

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="clientPassword" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="clientPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={clientFormData.password}
                      onChange={(e) =>
                        handleClientChange({
                          ...e,
                          target: { ...e.target, id: "password" },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                      placeholder="Create a strong password (min. 6 characters)"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={isLoading || !isClientFormValid()}
                >
                  {isLoading ? "Creating Account..." : "Sign Up as Client"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Already have an account?{" "}
            <Button asChild variant="link" className="px-2">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </p>
          <div className="text-center mt-2 text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/Terms&Conditions.pdf"
              className="underline underline-offset-4 text-foreground hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/Refund&CreditPolicy.pdf"
              className="underline underline-offset-4 text-foreground hover:text-primary"
            >
              Refund Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}