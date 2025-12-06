"use client";

import { createClient } from "@/utils/supabase/client";
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
import { User, Mail, Phone, Save, Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// --- Main Profile Page Component ---
export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // show/hide password locally (UI only)
  const [showPassword, setShowPassword] = useState(false);

  // Fetch user and profile data
  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          console.error("Error fetching user:", error?.message);
          setLoading(false);
          return;
        }
        setUser(user);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError.message);
        } else {
          setProfile(profileData);
          if (profileData?.profile_image) setProfileImage(profileData.profile_image);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Save form data to Supabase (profiles table)
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const updates = {
      id: user.id,
      first_name: formData.get("firstName"),
      last_name: formData.get("lastName"),
      company_email: formData.get("companyEmail"),
      phone: formData.get("phone"),
      company_name: formData.get("companyName"),
      updated_at: new Date(),
    };

    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      console.error("Profile update error:", error.message);
    } else {
      console.log("Profile updated!");
      // Refresh profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);
      if (profileData?.profile_image) setProfileImage(profileData.profile_image);
    }
    setLoading(false);
  };

  // Profile image upload
  const handleProfileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0] && user) {
      setLoading(true);
      const file = event.target.files[0];
      const supabase = createClient();

      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError.message);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setProfileImage(publicUrl);
      const { error } = await supabase
        .from("profiles")
        .update({ profile_image: publicUrl })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile image:", error.message);
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] w-full bg-muted/40 p-4 lg:p-8 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] w-full bg-muted/40 p-4 lg:px-8">
      {user ? (
        <p className="mb-2">Welcome, {user.email}</p>
      ) : (
        <p className="mb-4">Loading user...</p>
      )}

      <div className="max-w-6xl w-full ">
        <Card className="h-full flex flex-col">
          <CardHeader >
            <CardTitle className="flex items-center gap-2 pb-2">
              <User className="h-5 w-5" /> Your Profile
            </CardTitle>
            <CardDescription>Update your personal information below.</CardDescription>
          </CardHeader>

          <CardContent className="flex-grow">
            {/* Top area: avatar at left, name fields to the right (previous design) */}
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
              <div className="flex items-start gap-8">
                {/* Avatar column */}
                <div className="flex-shrink-0">
                  <div className="relative group">
                    <Avatar className="h-28 w-28">
                      <AvatarImage src={profileImage || undefined} alt="User profile picture" />
                      <AvatarFallback>
                        {profile?.first_name?.[0]}
                        {profile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => profileImageInputRef.current?.click()}
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </div>

                    <Input
                      ref={profileImageInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                    />
                  </div>
                </div>
              </div>

              {/* Rest of the form fields: 2 per row on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        defaultValue={profile?.first_name || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        defaultValue={profile?.last_name || ""}
                      />
                    </div>
                  </div>
                {/* Company Email */}
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="companyEmail"
                      name="companyEmail"
                      type="email"
                      className="pl-10"
                      defaultValue={profile?.company_email || ""}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="pl-10"
                      defaultValue={profile?.phone || ""}
                      placeholder="+91 83455 67890"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    defaultValue={profile?.company_name || ""}
                    placeholder="Your company name"
                  />
                </div>

                {/* Password (UI only — auth not updated here) */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password (min. 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-60" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
