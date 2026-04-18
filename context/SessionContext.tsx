"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from "react";

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
  isHydrated: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "sig_hire_session_id";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionIdState] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Wrapper for setSessionId that also saves to localStorage with debouncing
  const setSessionId = useCallback((id: string | null) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Update state immediately for UI responsiveness
    setSessionIdState(id);
    
    // Debounce localStorage write (300ms)
    debounceTimerRef.current = setTimeout(() => {
      if (typeof window !== "undefined") {
        if (id) {
          localStorage.setItem(SESSION_STORAGE_KEY, id);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    }, 300);
  }, []);

  const clearSession = useCallback(() => {
    setSessionId(null);
    setClientId(null);
    setError(null);
  }, [setSessionId]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
        isHydrated,
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
