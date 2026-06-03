-- Fix column names to match application code and add missing columns

-- Rename full_name → name (matches all app code)
ALTER TABLE public.users RENAME COLUMN full_name TO name;

-- Add tarot columns stored inline on users for fast dashboard reads
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tarot_card_type text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tarot_card_data jsonb;

-- Track whether a user has completed the 4-screen onboarding flow
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

-- Risk flag stored on user for quick admin overview
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS risk_flag text CHECK (risk_flag IN ('red', 'amber', 'green'));

-- Update trigger to use renamed column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  RETURN new;
END;
$$;
