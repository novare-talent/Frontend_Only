"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef } from "react";
import {
  Mail,
  Camera,
  Phone,
  EyeOff,
  Eye,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    githubLink: "",
    linkedinLink: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    githubLink: "",
    linkedinLink: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();

  const validateUrls = () => {
    const newErrors = {
      githubLink: "",
      linkedinLink: "",
    };

    // Validate GitHub URL
    if (formData.githubLink && !formData.githubLink.startsWith("https://github.com/")) {
      newErrors.githubLink = "GitHub URL must start with https://github.com/";
    }

    // Validate LinkedIn URL
    if (formData.linkedinLink && !formData.linkedinLink.startsWith("https://linkedin.com/in/") && 
        !formData.linkedinLink.startsWith("https://www.linkedin.com/in/")) {
      newErrors.linkedinLink = "LinkedIn URL must start with https://linkedin.com/in/ or https://www.linkedin.com/in/";
    }

    setErrors(newErrors);
    return !newErrors.githubLink && !newErrors.linkedinLink;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Step 1: Validate email domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(iitkgp\.ac\.in|iitb\.ac\.in|iitm\.ac\.in|iitk\.ac\.in|iitd\.ac\.in|iitg\.ac\.in|iitr\.ac\.in|iitbhu\.ac\.in|iitrpr\.ac\.in|iitbbs\.ac\.in|iitgn\.ac\.in|iith\.ac\.in|iiti\.ac\.in|iitj\.ac\.in|iitp\.ac\.in|iitmandi\.ac\.in|iitpkd\.ac\.in|iittp\.ac\.in|iitism\.ac\.in|iitbhilai\.ac\.in|iitgoa\.ac\.in|iitdh\.ac\.in)$/;

    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid Email Domain", {
        description:
          "Only IIT institutional emails are allowed (e.g., @iitd.ac.in, @iitb.ac.in, @iitkgp.ac.in, etc.).",
        duration: 5000,
        position: "top-right",
      });
      return;
    }

    // ✅ Step 2: Validate URLs
    if (!validateUrls()) {
      toast.error("Invalid URL", {
        description: "Please fix the URL errors before submitting.",
        duration: 5000,
        position: "top-right",
      });
      return;
    }

    try {
      // Step 3: Create user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        toast.error("Auth sign-up failed:", {
          description: signUpError.message,
          duration: 5000,
          position: "top-right",
        });
        return;
      }

      const user = data?.user;
      if (!user) {
        toast.error("Sign-up failed", {
          description: "No user returned",
          duration: 5000,
          position: "top-right",
        });
        return;
      }

      // Step 4: Upload profile image (optional)
      let profileImageUrl: string | null = null;
      if (profileImage) {
        console.log("Uploading profile image for user:", user.id);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(
            `${user.id}/${(profileImage as File).name}`,
            profileImage as File,
            {
              cacheControl: "3600",
              upsert: true,
            }
          );

        if (uploadError) {
          toast.error("Profile image upload failed:", {
            description: uploadError.message,
            duration: 5000,
            position: "top-right",
          });
        } else if (uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from("profile-images")
            .getPublicUrl(uploadData.path);

          profileImageUrl = publicUrlData.publicUrl;
          console.log("Profile image uploaded. Public URL:", profileImageUrl);
        }
      }

      // Step 5: Insert into profiles table
      console.log("Inserting profile row for user:", user.id);

      const { error: profileError } = await supabase.from("profiles").upsert([
        {
          id: user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          github_link: formData.githubLink,
          linkedin_link: formData.linkedinLink,
          profile_image: profileImageUrl,
        },
      ]);

      if (profileError) {
        toast.error("User created in Auth but profile insert failed", {
          description: profileError.message,
          duration: 5000,
          position: "top-right",
        });
        return;
      }

      toast("Account created successfully!", {
        description: "Please check your email to confirm.",
        duration: 10000,
        position: "top-right",
        style: {
          color: "#065f46",
          fontSize: "1.2rem",
          padding: "1.25rem",
          border: "1px solid #10b981",
          borderRadius: "0.75rem",
        },
      });
    } catch (err) {
      alert("Unexpected error: " + (err as Error).message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    
    if (errors.githubLink && id === "githubLink") {
      setErrors({ ...errors, githubLink: "" });
    }
    if (errors.linkedinLink && id === "linkedinLink") {
      setErrors({ ...errors, linkedinLink: "" });
    }
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfileImage(event.target.files[0]);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="mx-auto max-w-7xl p-4 py-6 shadow-lg w-96">
        <CardHeader className="text-center">
          <CardTitle className="font-ibm-plex-sans text-xl">
            Welcome Aboard
          </CardTitle>
          <CardDescription>
            Create an Account to build your professional profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Profile Picture Upload */}
            <div className="mb-6 flex flex-col items-center gap-2">
              <Label htmlFor="profile-picture">
                Profile Picture (Optional)
              </Label>
              <div
                className="relative group cursor-pointer"
                onClick={() => profileImageInputRef.current?.click()}
              >
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={
                      profileImage
                        ? URL.createObjectURL(profileImage)
                        : undefined
                    }
                  />
                  <AvatarFallback>
                    <span className="text-3xl">
                      {formData.firstName?.[0]}
                      {formData.lastName?.[0]}
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
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-2 mt-3">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  placeholder="First name"
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2 mt-3">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  placeholder="Last name"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-2 mt-3">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  className="pl-10"
                  placeholder="yourname@iitd.ac.in"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-2 mt-3">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  required
                  className="pl-10"
                  placeholder="+91 83455 67890"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-2 mt-3">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-2 mt-3">
              <Label htmlFor="githubLink">GitHub</Label>
              <Input
                id="githubLink"
                type="url"
                required
                onChange={handleChange}
                placeholder="https://github.com/username"
                className={errors.githubLink ? "border-red-500" : ""}
              />
              {errors.githubLink && (
                <p className="text-sm text-red-500">{errors.githubLink}</p>
              )}
            </div>

            <div className="grid gap-2 mt-3">
              <Label htmlFor="linkedinLink">LinkedIn</Label>
              <Input
                id="linkedinLink"
                type="url"
                required
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className={errors.linkedinLink ? "border-red-500" : ""}
              />
              {errors.linkedinLink && (
                <p className="text-sm text-red-500">{errors.linkedinLink}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-4">
              Sign Up
            </Button>
          </form>
          <div className="text-center text-md mt-5">
            Already have an account?{" "}
            <a href="/sign-in" className="underline underline-offset-4">
              Sign In
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
