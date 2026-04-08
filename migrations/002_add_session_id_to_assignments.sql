-- Migration: Add session_id to assignments table
-- This enables linking assignments directly to sessions for better tracking and retrieval

-- Add session_id column to assignments table
ALTER TABLE assignments 
ADD COLUMN session_id VARCHAR(36);

-- Create an index on session_id for faster queries
CREATE INDEX IF NOT EXISTS idx_assignments_session_id ON assignments(session_id);

-- Create an index on (session_id, candidate_id) for filtering assignments by session
CREATE INDEX IF NOT EXISTS idx_assignments_session_candidate ON assignments(session_id, candidate_id);

-- Note: Backfill existing assignments with session_id from job_id if needed
-- This assumes that in your system, job_id corresponds to session_id for some records
-- Uncomment and modify if needed:
-- UPDATE assignments SET session_id = job_id WHERE session_id IS NULL;
