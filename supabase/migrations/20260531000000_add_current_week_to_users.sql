-- Add current_week to users table for per-user roadmap progress
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS current_week integer NOT NULL DEFAULT 1;

ALTER TABLE users
  ADD CONSTRAINT users_current_week_range
  CHECK (current_week >= 1 AND current_week <= 8);

COMMENT ON COLUMN users.current_week IS 'Current week in the 8-week AI Champs program (1-8)';
