-- Performance indexes for sessions page
-- Run these in your Supabase SQL Editor to dramatically speed up queries

-- Index for rankings_sighire table (sessions query)
CREATE INDEX IF NOT EXISTS idx_rankings_sighire_profile_id_created 
ON rankings_sighire(profile_id, created_at DESC);

-- Index for jobs table (jobs lookup by form_id)
CREATE INDEX IF NOT EXISTS idx_jobs_form_id 
ON jobs(form_id);

-- Index for assignments table (assignments count query)
CREATE INDEX IF NOT EXISTS idx_assignments_job_id_candidate 
ON assignments(job_id, candidate_id);

-- Analyze tables to update statistics
ANALYZE rankings_sighire;
ANALYZE jobs;
ANALYZE assignments;
