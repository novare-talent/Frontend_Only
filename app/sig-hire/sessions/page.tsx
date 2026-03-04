"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useMultiSession, SessionData } from "@/context/MultiSessionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Eye, BookOpen } from "lucide-react";

function SessionsPageContent() {
  const router = useRouter();
  const supabase = createClient();
  const { sessions, currentSessionId, setCurrentSessionId, deleteSession, addSession, getSessionAssignments, loadSessions } =
    useMultiSession();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const [assignmentsCounts, setAssignmentsCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);
      
      // Load sessions from database for this user
      try {
        await loadSessions(user.id);
      } catch (err) {
        console.error("Failed to load sessions:", err);
      }
      
      setLoading(false);
    };
    loadUser();
  }, [loadSessions]);

  // Load assignments count for each session
  useEffect(() => {
    const loadAssignmentsCounts = async () => {
      const counts: Record<string, number> = {};
      for (const session of sessions) {
        const assignments = await getSessionAssignments(session.session_id);
        counts[session.session_id] = assignments.length;
      }
      setAssignmentsCounts(counts);
    };
    if (sessions.length > 0) {
      loadAssignmentsCounts();
    }
  }, [sessions, getSessionAssignments]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewSession = (sessionId: string, status: string) => {
    setCurrentSessionId(sessionId);
    // If initialized, go to uploads; if ready, go to rankings
    const route = status === "initialized" 
      ? `/sig-hire/uploads?session_id=${sessionId}`
      : `/sig-hire/rankings?session_id=${sessionId}`;
    router.push(route);
  };

  const handleViewAssignments = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const session = sessions.find(s => s.session_id === sessionId);
    if (session?.job_id) {
      // Navigate to evaluations page with job_id to view assignments and their submission status
      router.push(`/sig-hire/evaluations?job_id=${session.job_id}&session_id=${sessionId}`);
    } else {
      // Fallback to assignments creation page if job_id not available
      router.push(`/sig-hire/assignments?session_id=${sessionId}`);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm("Are you sure you want to delete this session? This will also delete all related assignments.")) {
      try {
        setCreatingSession(true);
        await deleteSession(sessionId);
        alert("Session deleted successfully");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete session");
      } finally {
        setCreatingSession(false);
      }
    }
  };

  const handleCreateNew = async () => {
    if (!user) {
      alert("Please log in to create a new session");
      return;
    }

    try {
      setCreatingSession(true);
      // Initialize new session
      const { initializeSession } = await import("@/lib/ranking-api");
      const sessionResponse = await initializeSession(user.id);

      if (!sessionResponse.session_id) {
        throw new Error("Failed to create session");
      }

      // Save to database
      await addSession({
        session_id: sessionResponse.session_id,
        client_id: user.id,
        status: "initialized",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Redirect to uploads
      router.push(
        `/sig-hire/uploads?session_id=${sessionResponse.session_id}`
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create session");
      setCreatingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 py-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Ranking Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Manage your candidate ranking and evaluation sessions
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          disabled={creatingSession}
          className="bg-gradient-to-r from-primary to-indigo-600"
        >
          {creatingSession ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </>
          )}
        </Button>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session: SessionData) => (
            <Card
              key={session.session_id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                currentSessionId === session.session_id
                  ? "ring-2 ring-primary"
                  : ""
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {session.job_name || "Untitled Job"}
                    </CardTitle>
                    <CardDescription>
                      {new Date(session.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(
                      session.status
                    )}`}
                  >
                    {session.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {session.candidates_count && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Candidates: </span>
                      <span className="font-semibold">
                        {session.candidates_count}
                      </span>
                    </div>
                  )}
                  {assignmentsCounts[session.session_id] !== undefined && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Assignments: </span>
                      <span className="font-semibold">
                        {assignmentsCounts[session.session_id]}
                      </span>
                    </div>
                  )}
                  {session.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Error: {session.error}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Button
                      onClick={() => handleViewSession(session.session_id, session.status)}
                      variant="default"
                      size="sm"
                      disabled={session.status === "failed" || session.status === "processing"}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {session.status === "initialized" ? "Upload Data" : "View Rankings"}
                    </Button>
                    {assignmentsCounts[session.session_id] !== undefined && assignmentsCounts[session.session_id] > 0 && (
                      <Button
                        onClick={() => handleViewAssignments(session.session_id)}
                        variant="outline"
                        size="sm"
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Assignments ({assignmentsCounts[session.session_id]})
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        handleDeleteSession(session.session_id)
                      }
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No Sessions Yet</CardTitle>
            <CardDescription>
              Create your first ranking session to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateNew} size="lg">
              Create New Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading sessions...</div>}>
      <SessionsPageContent />
    </Suspense>
  );
}
