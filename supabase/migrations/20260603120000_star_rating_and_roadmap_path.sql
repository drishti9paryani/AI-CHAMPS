-- Change ai_score from integer to numeric to support star ratings (0.5 increments, 1–5)
ALTER TABLE public.users ALTER COLUMN ai_score TYPE numeric(3,1) USING ai_score::numeric;

-- Drop old integer constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_ai_score_check;

-- Add new constraint: 0.5 to 5 in 0.5 steps
ALTER TABLE public.users ADD CONSTRAINT users_ai_score_check
  CHECK (ai_score >= 0.5 AND ai_score <= 5 AND (ai_score * 2) = FLOOR(ai_score * 2));

-- Add column to store the user's chosen custom roadmap path
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chosen_roadmap_path jsonb;

-- Add column to track which roadmap mode they picked ('fixed' or 'custom')
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS roadmap_mode text CHECK (roadmap_mode IN ('fixed', 'custom'));
