"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { createClient } from "@/utils/supabase/client";

export interface SessionData {
  session_id: string;
  client_id: string;
  job_id?: string;
  job_name?: string;
  job_description?: string;
  candidates_count?: number;
  status: "initialized" | "processing" | "ready" | "failed";
  created_at: string;
  updated_at: string;
  error?: string;
  ranking_results?: any;
  evaluation_results?: any;
}

interface MultiSessionContextType {
  sessions: SessionData[];
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  addSession: (session: SessionData) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<SessionData>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  loadSessions: (clientId: string) => Promise<void>;
  getSessionAssignments: (sessionId: string) => Promise<any[]>;
  isLoading: boolean;
}

const MultiSessionContext = createContext<MultiSessionContextType | undefined>(
  undefined
);

const SUPABASE_TABLE = "rankings_sighire";

export function MultiSessionProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("current_sighire_session_id");
      }
      return null;
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  // Set current session ID with localStorage persistence
  const setCurrentSessionId = (id: string | null) => {
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("current_sighire_session_id", id);
      } else {
        localStorage.removeItem("current_sighire_session_id");
      }
    }
    setCurrentSessionIdState(id);
  };

  // Load sessions from Supabase
  const loadSessions = useCallback(async (clientId: string) => {
    if (loadingRef.current) {
      console.log('[MultiSessionContext] Already loading, skipping...');
      return;
    }
    
    loadingRef.current = true;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select(`
          *,
          jobs!jobs_form_id_fkey(job_id)
        `)
        .eq("profile_id", clientId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error loading sessions:", error.message || JSON.stringify(error));
        return;
      }

      if (!data || data.length === 0) {
        setSessions([]);
        return;
      }

      const transformedSessions = data.map((row: any) => ({
        session_id: row.id,
        client_id: row.profile_id,
        job_id: row.jobs?.[0]?.job_id,
        job_name: row.queries?.[0]?.job_name || "Job Ranking Session",
        status: row.status,
        candidates_count: row.candidate_meta ? Object.keys(row.candidate_meta).length : 0,
        created_at: row.created_at,
        updated_at: row.closed_at || row.created_at,
        error: row.error,
        ranking_results: row.rankings,
      }));

      setSessions(transformedSessions);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [supabase]);

  // Get assignments for a session
  const getSessionAssignments = async (sessionId: string) => {
    try {
      // First, look up the job_id from the jobs table using form_id = sessionId
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("job_id")
        .eq("form_id", sessionId)
        .single();

      if (jobError) {
        // No job found for this session - assignments haven't been created yet
        return [];
      }

      if (!jobData?.job_id) {
        return [];
      }

      // Now fetch assignments using the job_id (excluding the template with candidate_id = 00000000-0000-0000-0000-000000000000)
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("job_id", jobData.job_id)
        .neq("candidate_id", "00000000-0000-0000-0000-000000000000")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading assignments:", error.message || JSON.stringify(error));
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Failed to load assignments:", err);
      return [];
    }
  };

  // Add session to local state and database
  const addSession = async (session: SessionData) => {
    try {
      // Check if session already exists in local state
      setSessions((prev) => {
        const exists = prev.some(s => s.session_id === session.session_id);
        if (exists) {
          return prev;
        }
        return [session, ...prev];
      });

      setCurrentSessionId(session.session_id);

      // Try to save to database, but don't fail if it errors
      // The session will still work from local state
      try {
        await supabase
          .from("rankings_sighire")
          .insert({
            id: session.session_id,
            profile_id: session.client_id,
            status: session.status || "initialized",
            created_at: session.created_at,
            updated_at: session.updated_at,
          })
          .single();
      } catch (dbErr) {
        console.warn("Database save failed (non-critical):", dbErr);
        // Continue anyway - session exists in local state
      }
    } catch (err) {
      console.error("Failed to add session:", err);
    }
  };

  // Update session in local state and database
  const updateSession = async (
    sessionId: string,
    updates: Partial<SessionData>
  ) => {
    try {
      // Map SessionData fields to rankings_sighire columns
      const dbUpdates: any = {};
      
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.error) dbUpdates.error = updates.error;
      if (updates.ranking_results) dbUpdates.rankings = updates.ranking_results;
      if (updates.candidates_count) {
        // Store candidates_count in candidate_meta if needed
        dbUpdates.candidate_meta = { count: updates.candidates_count };
      }
      
      // Always update closed_at as updated_at indicator
      dbUpdates.closed_at = new Date().toISOString();

      const { error } = await supabase
        .from(SUPABASE_TABLE)
        .update(dbUpdates)
        .eq("id", sessionId);

      if (error) {
        console.error("Error updating session:", error.message || JSON.stringify(error));
        return;
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === sessionId ? { ...s, ...updates } : s
        )
      );
    } catch (err) {
      console.error("Failed to update session:", err);
    }
  };

  // Delete session from database and local state
  const deleteSession = async (sessionId: string) => {
    try {
      // Step 1: Find all jobs for this session (where form_id = sessionId)
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("job_id")
        .eq("form_id", sessionId);

      if (jobsError) {
        console.warn("Warning fetching jobs:", jobsError.message);
      }

      // Step 2: Delete all assignments for those job_ids (also deletes evaluation_report data)
      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map((job: any) => job.job_id);
        
        const { error: deleteAssignmentsError } = await supabase
          .from("assignments")
          .delete()
          .in("job_id", jobIds);

        if (deleteAssignmentsError) {
          console.warn("Warning deleting assignments:", deleteAssignmentsError.message);
          // Continue with deletion even if this fails
        } else {
          console.log("Deleted assignments for job_ids:", jobIds);
        }

        // Step 3: Delete the jobs for this session
        const { error: deleteJobsError } = await supabase
          .from("jobs")
          .delete()
          .in("job_id", jobIds);

        if (deleteJobsError) {
          console.warn("Warning deleting jobs:", deleteJobsError.message);
          // Continue with session deletion even if job deletion fails
        } else {
          console.log("Deleted jobs for session:", sessionId);
        }
      }

      // Step 4: Delete the session record from rankings_sighire
      const { error: deleteSessionError } = await supabase
        .from(SUPABASE_TABLE)
        .delete()
        .eq("id", sessionId);

      if (deleteSessionError) {
        console.error("Error deleting session:", deleteSessionError.message || JSON.stringify(deleteSessionError));
        throw new Error(`Failed to delete session: ${deleteSessionError.message}`);
      }

      // Update local state after successful deletion
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
      console.log("Session and all related data deleted successfully:", sessionId);
    } catch (err) {
      console.error("Failed to delete session:", err);
      throw err;
    }
  };

  return (
    <MultiSessionContext.Provider
      value={{
        sessions,
        currentSessionId,
        setCurrentSessionId,
        addSession,
        updateSession,
        deleteSession,
        loadSessions,
        getSessionAssignments,
        isLoading,
      }}
    >
      {children}
    </MultiSessionContext.Provider>
  );
}

export function useMultiSession() {
  const context = useContext(MultiSessionContext);
  if (context === undefined) {
    throw new Error(
      "useMultiSession must be used within a MultiSessionProvider"
    );
  }
  return context;
}
