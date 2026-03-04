-- Migration: Create sighire_sessions table for managing multiple ranking/evaluation sessions
-- This enables support for managing multiple concurrent job ranking and evaluation sessions

CREATE TABLE IF NOT EXISTS sighire_sessions (
  session_id VARCHAR(36) PRIMARY KEY,
  client_id VARCHAR(36) NOT NULL,
  job_name VARCHAR(255),
  job_description TEXT,
  jd_file_url TEXT,
  candidates_count INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'initialized', -- initialized, processing, ready, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  error TEXT,
  ranking_results JSONB,
  evaluation_results JSONB,
  
  -- Foreign key to profiles table
  CONSTRAINT fk_sighire_sessions_client_id 
    FOREIGN KEY (client_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_sighire_sessions_client_id ON sighire_sessions(client_id);
CREATE INDEX idx_sighire_sessions_status ON sighire_sessions(status);
CREATE INDEX idx_sighire_sessions_created_at ON sighire_sessions(created_at DESC);

-- Enable RLS (Row Level Security) if using Supabase Auth
ALTER TABLE sighire_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own sessions
CREATE POLICY "Users can view their own sessions"
  ON sighire_sessions
  FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Users can create sessions"
  ON sighire_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own sessions"
  ON sighire_sessions
  FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Users can delete their own sessions"
  ON sighire_sessions
  FOR DELETE
  USING (auth.uid() = client_id);
