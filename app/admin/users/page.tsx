"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { DataTable } from "@/components/Admin-Dashboard/data-table";

const supabase = createClient();

export default function UsersPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, phone, github_link, linkedin_link, profile_image, created_at, updated_at, email, role, resume_url, github_profile"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error);
      setProfiles([]);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      {loading ? <p>Loading profiles...</p> : <DataTable data={profiles} />}
    </div>
  );
}
