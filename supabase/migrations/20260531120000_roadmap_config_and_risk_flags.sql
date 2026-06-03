-- roadmap_config: admin-editable program weeks
CREATE TABLE IF NOT EXISTS roadmap_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number integer NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  tools text[] NOT NULL DEFAULT '{}'
);

-- risk_flags: Claude-powered admin risk analysis results
CREATE TABLE IF NOT EXISTS risk_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  flag_color text NOT NULL CHECK (flag_color IN ('red', 'amber', 'green')),
  reason text NOT NULL,
  analyzed_at timestamptz NOT NULL DEFAULT now()
);

-- Optional role column for admin access (alongside is_admin)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

ALTER TABLE roadmap_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_flags DISABLE ROW LEVEL SECURITY;

-- Seed 8 default weeks when table is empty
INSERT INTO roadmap_config (week_number, title, description, tools)
SELECT w.week_number, w.title, w.description, w.tools
FROM (VALUES
  (1, 'AI Landscape & Tool Discovery', 'Explore the AI ecosystem and find your tools', ARRAY['ChatGPT', 'Claude', 'Perplexity']::text[]),
  (2, 'Workflow Design & Automation Thinking', 'Map processes and identify automation opportunities', ARRAY['Zapier', 'Make', 'Notion AI']::text[]),
  (3, 'Content Creation with AI', 'Write, design, and produce with AI assistance', ARRAY['Midjourney', 'Canva AI', 'Copy.ai']::text[]),
  (4, 'AI Video Production', 'Create compelling video content using AI', ARRAY['Runway', 'Pika', 'DIREC.A']::text[]),
  (5, 'AI Agents & Assistants', 'Build and deploy intelligent agents', ARRAY['Custom GPTs', 'Cursor', 'n8n']::text[]),
  (6, 'Department-Specific Use Cases', 'Apply AI to your team''s unique challenges', ARRAY['Internal docs', 'Team workshops']::text[]),
  (7, 'Building Internal Systems', 'Integrate AI into internal workflows', ARRAY['APIs', 'Supabase', 'Automation']::text[]),
  (8, 'Showcase & Graduation', 'Present your work and graduate as an AI Champ', ARRAY['Demo day', 'Portfolio']::text[])
) AS w(week_number, title, description, tools)
WHERE NOT EXISTS (SELECT 1 FROM roadmap_config LIMIT 1);
