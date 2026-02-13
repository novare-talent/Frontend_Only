"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface SessionContextType {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  clientId: string | null;
  setClientId: (id: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "sig_hire_session_id";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionIdState] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSessionId) {
        setSessionIdState(savedSessionId);
      }
      setIsHydrated(true);
    }
  }, []);

  // Wrapper for setSessionId that also saves to localStorage
  const setSessionId = (id: string | null) => {
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem(SESSION_STORAGE_KEY, id);
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setSessionIdState(id);
  };

  const clearSession = () => {
    setSessionId(null);
    setClientId(null);
    setError(null);
  };

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        setSessionId,
        clientId,
        setClientId,
        isLoading,
        setIsLoading,
        error,
        setError,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
