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
import {
  Github,
  Linkedin,
  User,
  Mail,
  Phone,
  Save,
  Camera,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import GithubScraper from "@/components/Candidate-Dashboard/Github-Connect";
import ResumeManager from "@/components/Candidate-Dashboard/ResumeUpload";


// --- Main Profile Page Component ---
export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // Save form data to Supabase
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const updates = {
      id: user.id,
      first_name: formData.get("firstName"),
      last_name: formData.get("lastName"),
      phone: formData.get("phone"),
      github_link: formData.get("githubLink"),
      linkedin_link: formData.get("linkedinLink"),
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

  // Handle resume updates from ResumeManager
  const handleResumeUpdate = async (resumeUrls: string[]) => {
    if (!user) return;
    
    setLoading(true);
    const supabase = createClient();
    
    // Update the resume_url column in profiles table
    const { error } = await supabase
      .from("profiles")
      .update({ resume_url: resumeUrls })
      .eq("id", user.id);
    
    if (error) {
      console.error("Error updating resume URLs:", error.message);
    } else {
      console.log("Resume URLs updated successfully");
      // Refresh profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);
    }
    setLoading(false);
  };

  // Prepare profile data for ResumeManager component
  const getResumeManagerData = () => {
    if (!profile) return { resume_url: [] };
    
    // Get resume URLs from the profile data
    // Based on your CSV, the column name is resume_url
    let resumeUrls = [];
    
    if (profile.resume_url) {
      // Handle different formats - array, string, or null
      if (Array.isArray(profile.resume_url)) {
        resumeUrls = profile.resume_url;
      } else if (typeof profile.resume_url === 'string') {
        // Parse if it's a string representation of an array
        try {
          resumeUrls = JSON.parse(profile.resume_url);
        } catch {
          resumeUrls = [profile.resume_url];
        }
      }
    }
    
    return {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      resume_url: resumeUrls
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-muted/40 p-4 lg:p-8 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-muted/40 p-4 lg:px-8">
      {user ? (
        <p className="mb-2">Welcome, {user.email}</p>
      ) : (
        <p className="mb-4">Loading user...</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-8 w-full h-full lg:h-[calc(100vh-4rem)]">
        {/* --- LEFT: User Profile Form --- */}
        <div className="lg:row-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 pb-2">
                <User className="h-5 w-5"/> Your Profile
              </CardTitle>
              <CardDescription>
                Update your personal and professional information.
              </CardDescription>
            </CardHeader>
            <CardContent className="grow overflow-y-auto min-h-0">
              <form
                onSubmit={handleFormSubmit}
                className="flex flex-col h-full"
              >
                {/* --- Editable Profile Picture --- */}
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={profileImage || undefined}
                        alt="User profile picture"
                      />
                      <AvatarFallback>
                        {profile?.first_name?.[0]}
                        {profile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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

                <div className="space-y-6 grow mt-2">
                  {/* Name Fields */}
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
                  {/* Contact Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        defaultValue={user?.email || ""}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={profile?.phone || ""}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {/* Social Links */}
                  <div className="space-y-2">
                    <Label htmlFor="githubLink">GitHub Profile</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="githubLink"
                        name="githubLink"
                        defaultValue={profile?.github_link || ""}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinLink">LinkedIn Profile</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="linkedinLink"
                        name="linkedinLink"
                        defaultValue={profile?.linkedin_link || ""}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-6">
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* --- TOP-RIGHT: GitHub Statistics --- */}
        <GithubScraper />

        {/* --- BOTTOM-RIGHT: Upload Resume Section --- */}
        <ResumeManager 
          profileData={getResumeManagerData()} 
          onResumeUpdate={handleResumeUpdate}
          userId={user?.id}
        />
      </div>
    </div>
  );
}