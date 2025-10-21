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
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    console.group('🔍 SIGNUP DEBUG - START');
    console.log('📝 Form data:', formData);
    console.log('🔑 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('📁 Profile image:', profileImage ? `Exists (${profileImage.name}, ${profileImage.size} bytes)` : 'None');

    // ✅ Step 1: Validate email domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(iitkgp\.ac\.in|iitb\.ac\.in|iitm\.ac\.in|iitk\.ac\.in|iitd\.ac\.in|iitg\.ac\.in|iitr\.ac\.in|iitbhu\.ac\.in|iitrpr\.ac\.in|iitbbs\.ac\.in|iitgn\.ac\.in|iith\.ac\.in|iiti\.ac\.in|iitj\.ac\.in|iitp\.ac\.in|iitmandi\.ac\.in|iitpkd\.ac\.in|iittp\.ac\.in|iitism\.ac\.in|iitbhilai\.ac\.in|iitgoa\.ac\.in|iitdh\.ac\.in)$/;

    if (!emailRegex.test(formData.email)) {
      console.error('❌ Email domain validation failed');
      toast.error("Invalid Email Domain", {
        description: "Only IIT institutional emails are allowed.",
        duration: 5000,
        position: "top-right",
      });
      setIsLoading(false);
      console.groupEnd();
      return;
    }

    // ✅ Step 2: Validate URLs
    if (!validateUrls()) {
      console.error('❌ URL validation failed:', errors);
      toast.error("Invalid URL", {
        description: "Please fix the URL errors before submitting.",
        duration: 5000,
        position: "top-right",
      });
      setIsLoading(false);
      console.groupEnd();
      return;
    }

    // ✅ Step 3: Validate password
    if (formData.password.length < 6) {
      console.error('❌ Password too short:', formData.password.length);
      toast.error("Password too short", {
        description: "Password must be at least 6 characters.",
        duration: 5000,
        position: "top-right",
      });
      setIsLoading(false);
      console.groupEnd();
      return;
    }

    try {
      console.log('🚀 Attempting Supabase auth signup...');
      
      // Step 4: Create user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      console.log('📨 Auth signup response:', { 
        data: data ? 'Received' : 'No data', 
        error: signUpError 
      });

      if (signUpError) {
        console.error('❌ Auth signup failed with details:', {
          name: signUpError.name,
          message: signUpError.message,
          status: signUpError.status,
          stack: signUpError.stack
        });

        // Enhanced error mapping
        let errorDescription = signUpError.message;
        let errorTitle = "Sign-up Failed";

        if (signUpError.status === 422) {
          errorTitle = "Invalid Data";
          errorDescription = "The provided data is invalid. Please check your email and password.";
        } else if (signUpError.status === 429) {
          errorTitle = "Too Many Requests";
          errorDescription = "Too many sign-up attempts. Please try again later.";
        } else if (signUpError.status === 500) {
          errorTitle = "Server Error";
          errorDescription = "Authentication service is temporarily unavailable. This could be due to: \n• Supabase project configuration \n• Database connection issues \n• Email service problems";
        } else if (signUpError.message?.includes("already registered") || signUpError.message?.includes("user_exists")) {
          errorTitle = "Email Already Registered";
          errorDescription = "This email is already registered. Please sign in instead.";
        } else if (signUpError.message?.includes("password")) {
          errorTitle = "Weak Password";
          errorDescription = "Password does not meet security requirements. Must be at least 6 characters.";
        } else if (signUpError.message?.includes("email")) {
          errorTitle = "Invalid Email";
          errorDescription = "Please provide a valid email address.";
        }

        toast.error(errorTitle, {
          description: errorDescription,
          duration: 7000,
          position: "top-right",
        });

        setIsLoading(false);
        console.groupEnd();
        return;
      }

      const user = data?.user;
      console.log('👤 User object received:', user ? {
        id: user.id,
        email: user.email,
        confirmed: user.confirmed_at ? 'Yes' : 'No'
      } : 'No user object');

      if (!user) {
        console.error('❌ No user object returned from auth');
        toast.error("Sign-up Failed", {
          description: "No user account was created. Please try again.",
          duration: 5000,
          position: "top-right",
        });
        setIsLoading(false);
        console.groupEnd();
        return;
      }

      console.log('✅ Auth successful, proceeding to profile creation...');

      // Step 5: Upload profile image (optional)
      let profileImageUrl: string | null = null;
      if (profileImage) {
        console.log('🖼️ Starting profile image upload...');
        
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("profile-images")
            .upload(
              `${user.id}/${profileImage.name}`,
              profileImage,
              {
                cacheControl: "3600",
                upsert: false,
              }
            );

          if (uploadError) {
            console.error('❌ Profile image upload failed:', uploadError);
            toast.error("Profile Image Upload Failed", {
              description: "Your account was created but we couldn't upload your profile image. You can update it later.",
              duration: 5000,
              position: "top-right",
            });
          } else if (uploadData) {
            console.log('✅ Profile image uploaded successfully');
            const { data: publicUrlData } = supabase.storage
              .from("profile-images")
              .getPublicUrl(uploadData.path);

            profileImageUrl = publicUrlData.publicUrl;
            console.log('🔗 Profile image URL:', profileImageUrl);
          }
        } catch (uploadErr) {
          console.error('❌ Unexpected error during image upload:', uploadErr);
          // Don't fail the entire signup for image upload errors
        }
      }

      // Step 6: Insert into profiles table
      console.log('💾 Inserting profile data...');
      
      const profileData = {
        id: user.id,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        github_link: formData.githubLink,
        linkedin_link: formData.linkedinLink,
        profile_image: profileImageUrl,
      };

      console.log('📋 Profile data to insert:', profileData);

      const { error: profileError } = await supabase.from("profiles").upsert([profileData]);

      if (profileError) {
        console.error('❌ Profile creation failed:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });

        let profileErrorDescription = profileError.message;
        
        if (profileError.code === '42501') {
          profileErrorDescription = "Database permission denied. Check RLS policies.";
        } else if (profileError.code === '23505') {
          profileErrorDescription = "Profile already exists for this user.";
        } else if (profileError.message?.includes('row-level security')) {
          profileErrorDescription = "Database security policy prevented profile creation.";
        }

        toast.error("Profile Creation Failed", {
          description: `Account created but profile setup failed: ${profileErrorDescription}`,
          duration: 7000,
          position: "top-right",
        });

        setIsLoading(false);
        console.groupEnd();
        return;
      }

      console.log('✅ Profile created successfully!');
      console.log('🎉 Signup process completed successfully');

      toast.success("Account Created Successfully!", {
        description: "Please check your email to confirm your account.",
        duration: 10000,
        position: "top-right",
      });

      // Optional: Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        githubLink: "",
        linkedinLink: "",
        password: "",
      });
      setProfileImage(null);

    } catch (err) {
      console.error('💥 Unexpected error in signup process:', err);
      toast.error("Unexpected Error", {
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`,
        duration: 7000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
      console.groupEnd();
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
                  value={formData.firstName}
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
                  value={formData.lastName}
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
                  value={formData.email}
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
                  value={formData.phone}
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password (min. 6 characters)"
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
                value={formData.githubLink}
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
                value={formData.linkedinLink}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className={errors.linkedinLink ? "border-red-500" : ""}
              />
              {errors.linkedinLink && (
                <p className="text-sm text-red-500">{errors.linkedinLink}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
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