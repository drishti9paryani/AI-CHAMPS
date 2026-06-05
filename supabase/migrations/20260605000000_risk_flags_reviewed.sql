-- Add reviewed_at to risk_flags so admin dismissals persist across sessions
ALTER TABLE public.risk_flags ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Also add a lightweight reviewed flag on users for quick admin lookups
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS risk_reviewed_at timestamptz;
