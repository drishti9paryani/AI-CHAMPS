# AI Champs Dashboard

Internal tool for **White Rivers Media** to identify and nurture AI-forward employees (AI Champs). Users complete a 4-step onboarding flow; admins get analytics and management tools.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — dark glassmorphism UI
- **Supabase** — Postgres database + Auth
- **Anthropic Claude** — tarot cards, insights, risk analysis (server-side API routes)

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com/)

## Clone & Install

```bash
git clone <your-repo-url>
cd ai-champs
npm install
```

## Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-only, for admin API routes) |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for `/api/tarot`, `/api/insights`, `/api/risk-analysis` |
| `NEXT_PUBLIC_SITE_URL` | Yes | App URL (`http://localhost:3000` locally; your Vercel URL in production) |

> **Note:** `NEXTAUTH_SECRET` is **not used** — this app uses Supabase Auth.

## Supabase Setup

### 1. Run the schema

Open the Supabase SQL Editor and run the schema from the repo root:

```
../supabase/schema.sql
```

This creates tables: `users`, `submissions`, `announcements`, `resources`, `active_week`, and seeds the default active week.

### 2. Run migrations

Apply additional migrations in `supabase/migrations/` (e.g. `current_week` column on users, `roadmap_config`, `risk_flags` if present).

### 3. Configure Auth

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL:** `http://localhost:3000` (or your Vercel URL)
- **Redirect URLs:** add `http://localhost:3000/auth/callback` and your production callback URL

### 4. Create an admin user

After a user signs up, promote them in SQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@whiteriversmedia.com';
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to dashboard or onboarding |
| `/onboarding/register` | Step 1 — profile |
| `/onboarding/tarot` | Step 2 — AI tarot card |
| `/onboarding/form` | Step 3 — champ form |
| `/onboarding/roadmap` | Step 4 — program roadmap |
| `/dashboard` | User dashboard |
| `/admin` | Admin dashboard (admin role required) |

## Deploy to Vercel

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Import the project in [Vercel](https://vercel.com) — set the root directory to `ai-champs` if the repo contains other folders.
3. Add all environment variables from `.env.example` in Vercel → Settings → Environment Variables.
4. Set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. `https://ai-champs.vercel.app`).
5. Update Supabase Auth redirect URLs to include `https://your-domain.vercel.app/auth/callback`.
6. Deploy — Vercel auto-detects Next.js via `vercel.json`.

```bash
# Optional: deploy via CLI
npx vercel --prod
```

## Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                  # App Router pages & API routes
│   ├── onboarding/       # 4-step onboarding flow
│   ├── dashboard/        # User dashboard
│   ├── admin/            # Admin dashboard
│   └── api/              # tarot, insights, risk-analysis
├── components/
│   ├── onboarding/       # Onboarding screens
│   ├── dashboard/        # Dashboard sections
│   ├── admin/            # Admin tabs & sidebar
│   └── ui/               # Shared UI (GlassCard, Skeleton, etc.)
└── lib/                  # Supabase clients, auth, utilities
```

## License

Internal use — White Rivers Media.
