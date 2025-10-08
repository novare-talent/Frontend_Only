"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const supabase = createClient();

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchUser(id);
  }, [id]);

  const fetchUser = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
    } else {
      setUser(data);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    setDeleting(false);

    if (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    } else {
      alert("User deleted successfully");
      router.push("/users"); // redirect back to users list
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <p className="p-4">User not found</p>;

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.profile_image} alt={user.first_name} />
            <AvatarFallback>
              {user.first_name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">
              {user.first_name} {user.last_name}
            </CardTitle>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Role: {user.role || "—"}
            </p>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-4 pt-4">
          <div>
            <p className="font-medium">Phone</p>
            <p className="text-muted-foreground">{user.phone || "—"}</p>
          </div>

          <div>
            <p className="font-medium">GitHub</p>
            {user.github_link ? (
              <a
                href={user.github_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {user.github_link}
              </a>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </div>

          <div>
            <p className="font-medium">LinkedIn</p>
            {user.linkedin_link ? (
              <a
                href={user.linkedin_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {user.linkedin_link}
              </a>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </div>

          <div>
            <p className="font-medium">Joined</p>
            <p className="text-muted-foreground">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>

          <div>
            <p className="font-medium">Resume</p>
            {user.resume_url ? (
              <a
                href={Array.isArray(user.resume_url) ? user.resume_url[0] : user.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                View Resume
              </a>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </div>

          {/* Delete Action */}
          <div className="pt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete User</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {user.first_name} {user.last_name}
                  </span>
                  ? This action cannot be undone.
                </p>
                <DialogFooter className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click()}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Confirm Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
