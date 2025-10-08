"use client";

import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  github_link?: string | null;
  linkedin_link?: string | null;
  profile_image?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  email?: string | null;
  role?: string | null;
  resume_url?: string[] | string | null;
  github_profile?: any | null;
}

export function DataTable({ data }: { data: Profile[] }) {
  return (
    <div className="border rounded-lg shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>GitHub</TableHead>
            <TableHead>LinkedIn</TableHead>
            <TableHead>Resume(s)</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((user) => {
            const displayName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

            return (
              <TableRow key={user.id}>
                <TableCell className="w-12">
                  <Link href={`/admin/users/${user.id}`}>
                    {user.profile_image ? (
                      <Image
                        src={user.profile_image}
                        alt={displayName || "avatar"}
                        className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 hover:bg-gray-200 transition">
                        {user.first_name ? user.first_name[0] : "?"}
                      </div>
                    )}
                  </Link>
                </TableCell>

                <TableCell>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="hover:underline font-medium"
                  >
                    {displayName || "—"}
                  </Link>
                </TableCell>

                <TableCell>{user.email ?? "—"}</TableCell>
                <TableCell>{user.phone ?? "—"}</TableCell>
                <TableCell className="capitalize">{user.role ?? "—"}</TableCell>

                <TableCell>
                  {user.github_link ? (
                    <a
                      href={user.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-sm"
                    >
                      Link
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>

                <TableCell>
                  {user.linkedin_link ? (
                    <a
                      href={user.linkedin_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-sm"
                    >
                      Link
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>

                <TableCell>
                  {user.resume_url ? "Available" : "—"}
                </TableCell>

                <TableCell>
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
