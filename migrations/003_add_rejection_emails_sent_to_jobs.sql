-- Add rejection_emails_sent flag to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS rejection_emails_sent BOOLEAN DEFAULT FALSE;
