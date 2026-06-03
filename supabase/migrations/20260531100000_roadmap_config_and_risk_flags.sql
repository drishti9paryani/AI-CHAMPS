-- Roadmap configuration (admin-editable, user-facing)
CREATE TABLE IF NOT EXISTS roadmap_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number integer NOT NULL UNIQUE CHECK (week_number >= 1 AND week_number <= 8),
  title text NOT NULL,
  description text NOT NULL,
  tools text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AI-generated risk flags per user
CREATE TABLE IF NOT EXISTS risk_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flag_color text NOT NULL CHECK (flag_color IN ('red', 'amber', 'green')),
  reason text NOT NULL,
  auto_generated boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS risk_flags_user_id_idx ON risk_flags(user_id);

-- Role column for admin access (alongside legacy is_admin)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Seed default 8-week roadmap
INSERT INTO roadmap_config (week_number, title, description, tools) VALUES
  (1, 'AI Landscape & Tool Discovery', 'Explore the AI ecosystem and find your tools', ARRAY['Gemini', 'Claude', 'ChatGPT', 'Perplexity']),
  (2, 'Workflow Design & Automation Thinking', 'Map processes and identify automation opportunities', ARRAY['n8n', 'Apify', 'ChatGPT']),
  (3, 'Content Creation with AI', 'Write, design, and produce with AI assistance', ARRAY['Claude', 'ChatGPT', 'Midjourney', 'NotebookLM']),
  (4, 'AI Video Production', 'Create compelling video content using AI', ARRAY['Higgsfield', 'Gemini', 'Suno']),
  (5, 'AI Agents & Assistants', 'Build and deploy intelligent agents', ARRAY['Claude', 'ChatGPT', 'n8n']),
  (6, 'Department-Specific Use Cases', 'Apply AI to your team''s unique challenges', ARRAY['Gemini', 'Claude', 'Perplexity']),
  (7, 'Building Internal Systems', 'Integrate AI into internal workflows', ARRAY['n8n', 'Apify', 'Claude']),
  (8, 'Showcase & Graduation', 'Present your work and graduate as an AI Champ', ARRAY['ChatGPT', 'Claude', 'Midjourney'])
ON CONFLICT (week_number) DO NOTHING;
