"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState, useRef } from "react"
import { Mail, Camera, Phone, EyeOff, Eye } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [signupType, setSignupType] = useState<"user" | "client">("user")

  const [userFormData, setUserFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    githubLink: "",
    linkedinLink: "",
    password: "",
  })

  const [clientFormData, setClientFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    password: "",
  })

  const [userErrors, setUserErrors] = useState({
    githubLink: "",
    linkedinLink: "",
  })

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const validateUserUrls = () => {
    const newErrors = {
      githubLink: "",
      linkedinLink: "",
    }

    if (userFormData.githubLink && !userFormData.githubLink.startsWith("https://github.com/")) {
      newErrors.githubLink = "GitHub URL must start with https://github.com/"
    }

    if (
      userFormData.linkedinLink &&
      !userFormData.linkedinLink.startsWith("https://linkedin.com/in/") &&
      !userFormData.linkedinLink.startsWith("https://www.linkedin.com/in/")
    ) {
      newErrors.linkedinLink = "LinkedIn URL must start with https://linkedin.com/in/ or https://www.linkedin.com/in/"
    }

    setUserErrors(newErrors)
    return !newErrors.githubLink && !newErrors.linkedinLink
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.group("🔍 USER SIGNUP DEBUG - START")
    console.log("📝 Form data:", userFormData)

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@(iitkgp\.ac\.in|iitb\.ac\.in|iitm\.ac\.in|iitk\.ac\.in|iitd\.ac\.in|iitg\.ac\.in|iitr\.ac\.in|iitbhu\.ac\.in|iitrpr\.ac\.in|iitbbs\.ac\.in|iitgn\.ac\.in|iith\.ac\.in|iiti\.ac\.in|iitj\.ac\.in|iitp\.ac\.in|iitmandi\.ac\.in|iitpkd\.ac\.in|iittp\.ac\.in|iitism\.ac\.in|iitbhilai\.ac\.in|iitgoa\.ac\.in|iitdh\.ac\.in)$/

    if (!emailRegex.test(userFormData.email)) {
      console.error("❌ Email domain validation failed")
      toast.error("Invalid Email Domain", {
        description: "Only IIT institutional emails are allowed.",
        duration: 5000,
        position: "top-right",
      })
      setIsLoading(false)
      console.groupEnd()
      return
    }

    if (!validateUserUrls()) {
      console.error("❌ URL validation failed:", userErrors)
      toast.error("Invalid URL", {
        description: "Please fix the URL errors before submitting.",
        duration: 5000,
        position: "top-right",
      })
      setIsLoading(false)
      console.groupEnd()
      return
    }

    if (userFormData.password.length < 6) {
      console.error("❌ Password too short:", userFormData.password.length)
      toast.error("Password too short", {
        description: "Password must be at least 6 characters.",
        duration: 5000,
        position: "top-right",
      })
      setIsLoading(false)
      console.groupEnd()
      return
    }

    try {
      console.log("🚀 Attempting Supabase auth signup...")

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
      })

      console.log("📨 Auth signup response:", {
        data: data ? "Received" : "No data",
        error: signUpError,
      })

      if (signUpError) {
        console.error("❌ Auth signup failed with details:", {
          name: signUpError.name,
          message: signUpError.message,
          status: signUpError.status,
        })

        let errorDescription = signUpError.message
        let errorTitle = "Sign-up Failed"

        if (signUpError.status === 422) {
          errorTitle = "Invalid Data"
          errorDescription = "The provided data is invalid. Please check your email and password."
        } else if (signUpError.status === 429) {
          errorTitle = "Too Many Requests"
          errorDescription = "Too many sign-up attempts. Please try again later."
        } else if (signUpError.status === 500) {
          errorTitle = "Server Error"
          errorDescription = "Authentication service is temporarily unavailable."
        } else if (
          signUpError.message?.includes("already registered") ||
          signUpError.message?.includes("user_exists")
        ) {
          errorTitle = "Email Already Registered"
          errorDescription = "This email is already registered. Please sign in instead."
        }

        toast.error(errorTitle, {
          description: errorDescription,
          duration: 7000,
          position: "top-right",
        })

        setIsLoading(false)
        console.groupEnd()
        return
      }

      const user = data?.user
      console.log("👤 User object received:", user ? { id: user.id, email: user.email } : "No user object")

      if (!user) {
        console.error("❌ No user object returned from auth")
        toast.error("Sign-up Failed", {
          description: "No user account was created. Please try again.",
          duration: 5000,
          position: "top-right",
        })
        setIsLoading(false)
        console.groupEnd()
        return
      }

      console.log("✅ Auth successful, proceeding to profile creation...")

      let profileImageUrl: string | null = null
      if (profileImage) {
        console.log("🖼️ Starting profile image upload...")

        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("profile-images")
            .upload(`${user.id}/${profileImage.name}`, profileImage, {
              cacheControl: "3600",
              upsert: false,
            })

          if (uploadError) {
            console.error("❌ Profile image upload failed:", uploadError)
            toast.error("Profile Image Upload Failed", {
              description:
                "Your account was created but we couldn't upload your profile image. You can update it later.",
              duration: 5000,
              position: "top-right",
            })
          } else if (uploadData) {
            console.log("✅ Profile image uploaded successfully")
            const { data: publicUrlData } = supabase.storage.from("profile-images").getPublicUrl(uploadData.path)

            profileImageUrl = publicUrlData.publicUrl
            console.log("🔗 Profile image URL:", profileImageUrl)
          }
        } catch (uploadErr) {
          console.error("❌ Unexpected error during image upload:", uploadErr)
        }
      }

      console.log("💾 Inserting profile data...")

      const profileData = {
        id: user.id,
        email: userFormData.email,
        first_name: userFormData.firstName,
        last_name: userFormData.lastName,
        phone: userFormData.phone,
        github_link: userFormData.githubLink,
        linkedin_link: userFormData.linkedinLink,
        profile_image: profileImageUrl,
        role: "user",
      }

      console.log("📋 Profile data to insert:", profileData)

      const { error: profileError } = await supabase.from("profiles").upsert([profileData])

      if (profileError) {
        console.error("❌ Profile creation failed:", {
          message: profileError.message,
          code: profileError.code,
        })

        toast.error("Profile Creation Failed", {
          description: `Account created but profile setup failed: ${profileError.message}`,
          duration: 7000,
          position: "top-right",
        })

        setIsLoading(false)
        console.groupEnd()
        return
      }

      console.log("✅ Profile created successfully!")
      console.log("🎉 User signup process completed successfully")

      toast.success("Account Created Successfully!", {
        description: "Please check your email to confirm your account.",
        duration: 10000,
        position: "top-right",
      })

      setUserFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        githubLink: "",
        linkedinLink: "",
        password: "",
      })
      setProfileImage(null)
    } catch (err) {
      console.error("💥 Unexpected error in signup process:", err)
      toast.error("Unexpected Error", {
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : "Unknown error"}`,
        duration: 7000,
        position: "top-right",
      })
    } finally {
      setIsLoading(false)
      console.groupEnd()
    }
  }

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.group("🔍 CLIENT SIGNUP DEBUG - START")
    console.log("📝 Form data:", clientFormData)

    if (!clientFormData.email || !clientFormData.email.includes("@")) {
      console.error("❌ Email validation failed")
      toast.error("Invalid Email", {
        description: "Please provide a valid email address.",
        duration: 5000,
        position: "top-right",
      })
      setIsLoading(false)
      console.groupEnd()
      return
    }

    if (clientFormData.password.length < 6) {
      console.error("❌ Password too short:", clientFormData.password.length)
      toast.error("Password too short", {
        description: "Password must be at least 6 characters.",
        duration: 5000,
        position: "top-right",
      })
      setIsLoading(false)
      console.groupEnd()
      return
    }

    try {
      console.log("🚀 Attempting Supabase auth signup for client...")

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
      })

      console.log("📨 Auth signup response:", {
        data: data ? "Received" : "No data",
        error: signUpError,
      })

      if (signUpError) {
        console.error("❌ Auth signup failed:", signUpError.message)

        let errorDescription = signUpError.message
        let errorTitle = "Sign-up Failed"

        if (signUpError.message?.includes("already registered") || signUpError.message?.includes("user_exists")) {
          errorTitle = "Email Already Registered"
          errorDescription = "This email is already registered. Please sign in instead."
        }

        toast.error(errorTitle, {
          description: errorDescription,
          duration: 7000,
          position: "top-right",
        })

        setIsLoading(false)
        console.groupEnd()
        return
      }

      const user = data?.user
      console.log("👤 User object received:", user ? { id: user.id, email: user.email } : "No user object")

      if (!user) {
        console.error("❌ No user object returned from auth")
        toast.error("Sign-up Failed", {
          description: "No user account was created. Please try again.",
          duration: 5000,
          position: "top-right",
        })
        setIsLoading(false)
        console.groupEnd()
        return
      }

      console.log("✅ Auth successful, proceeding to profile creation...")

      console.log("💾 Inserting client profile data...")

      const profileData = {
        id: user.id,
        email: clientFormData.email,
        first_name: clientFormData.firstName,
        last_name: clientFormData.lastName,
        phone: clientFormData.phone,
        company_name: clientFormData.companyName,
        role: "client",
      }

      console.log("📋 Profile data to insert:", profileData)

      const { error: profileError } = await supabase.from("profiles").upsert([profileData])

      if (profileError) {
        console.error("❌ Profile creation failed:", profileError.message)

        toast.error("Profile Creation Failed", {
          description: `Account created but profile setup failed: ${profileError.message}`,
          duration: 7000,
          position: "top-right",
        })

        setIsLoading(false)
        console.groupEnd()
        return
      }

      console.log("✅ Client profile created successfully!")
      console.log("🎉 Client signup process completed successfully")

      toast.success("Client Account Created Successfully!", {
        description: "Please check your email to confirm your account.",
        duration: 10000,
        position: "top-right",
      })

      setClientFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyName: "",
        password: "",
      })
    } catch (err) {
      console.error("💥 Unexpected error in client signup process:", err)
      toast.error("Unexpected Error", {
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : "Unknown error"}`,
        duration: 7000,
        position: "top-right",
      })
    } finally {
      setIsLoading(false)
      console.groupEnd()
    }
  }

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setUserFormData({ ...userFormData, [id]: value })

    if (userErrors.githubLink && id === "githubLink") {
      setUserErrors({ ...userErrors, githubLink: "" })
    }
    if (userErrors.linkedinLink && id === "linkedinLink") {
      setUserErrors({ ...userErrors, linkedinLink: "" })
    }
  }

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setClientFormData({ ...clientFormData, [id]: value })
  }

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfileImage(event.target.files[0])
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="mx-auto max-w-7xl p-4 py-6 shadow-lg w-96">
        <CardHeader className="text-center">
          <CardTitle className="font-ibm-plex-sans text-xl">Welcome Aboard</CardTitle>
          <CardDescription>Create an Account to build your professional profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={signupType}
            onValueChange={(value) => setSignupType(value as "user" | "client")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">User Sign Up</TabsTrigger>
              <TabsTrigger value="client">Client Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleUserSubmit}>
                {/* Profile Picture Upload */}
                <div className="mb-6 flex flex-col items-center gap-2">
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
                      value={userFormData.firstName}
                      onChange={handleUserChange}
                    />
                  </div>
                  <div className="grid gap-2 mt-3">
                    <Label htmlFor="lastName">Last Name</Label>
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
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      className="pl-10"
                      placeholder="yourname@iitd.ac.in"
                      value={userFormData.email}
                      onChange={handleUserChange}
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
                      value={userFormData.phone}
                      onChange={handleUserChange}
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
                    value={userFormData.githubLink}
                    onChange={handleUserChange}
                    placeholder="https://github.com/username"
                    className={userErrors.githubLink ? "border-red-500" : ""}
                  />
                  {userErrors.githubLink && <p className="text-sm text-red-500">{userErrors.githubLink}</p>}
                </div>

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="linkedinLink">LinkedIn</Label>
                  <Input
                    id="linkedinLink"
                    type="url"
                    required
                    value={userFormData.linkedinLink}
                    onChange={handleUserChange}
                    placeholder="https://linkedin.com/in/username"
                    className={userErrors.linkedinLink ? "border-red-500" : ""}
                  />
                  {userErrors.linkedinLink && <p className="text-sm text-red-500">{userErrors.linkedinLink}</p>}
                </div>

                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="client">
              <form onSubmit={handleClientSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="grid gap-2 mt-3">
                    <Label htmlFor="clientFirstName">First Name</Label>
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
                    <Label htmlFor="clientLastName">Last Name</Label>
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
                  <Label htmlFor="clientEmail">Company Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="clientEmail"
                      type="email"
                      required
                      className="pl-10"
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
                </div>

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="clientPhone">Phone Number</Label>
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
                  <Label htmlFor="clientCompanyName">Company Name</Label>
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
                  <Label htmlFor="clientPassword">Password</Label>
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
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Sign Up as Client"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-md mt-5">
            Already have an account?{" "}
            <a href="/sign-in" className="underline underline-offset-4">
              Sign In
            </a>
          </div>
          <div className="px-6 text-center mt-4 text-sm text-muted-foreground">
            By clicking continue, you agree to our <a href="/Terms&Conditions.pdf" className="underline underline-offset-4">Terms of Service</a>{" "}
            and <a href="/Refund&CreditPolicy.pdf" className="underline underline-offset-4">Refund Policy</a>.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
