# Admin Dashboard V1 — Design Spec
**Date:** 2026-06-04  
**Project:** AI Champs — White Rivers Media  
**Scope:** Add 4 new tabs to the existing admin dashboard; leave existing 6 tabs untouched.

---

## 1. Context

The existing admin dashboard (`/admin`) has 6 tabs: Overview, All Users, AI Insights, Risk Flags, Export, Roadmap Editor. These are kept as-is. This spec covers 4 new tabs added alongside them, plus an enrichment of the existing AI Insights tab.

Access is restricted to 1–2 specific email addresses via middleware (not role-based).

---

## 2. New Tabs

### Tab 1: Champion View
**Purpose:** Search and inspect any individual AI Champ.

**Features:**
- Search bar (by name or department)
- Employee profile card: Name, Department, AI Score, Archetype, Join Date, Current Roadmap Week, Completion %, Last Active Date
- Activity section: Current Project, Biggest Challenge, Support Needed
- Activity timeline: ordered list of onboarding events, submission timestamps, roadmap milestones
- Empty state when no user is selected

**Data sources:** `users` table, `submissions` table

---

### Tab 2: Team View
**Purpose:** Department-level health and adoption overview.

**Features:**
- Summary cards: Strongest Team, Team Needing Support, Total Departments
- Per-department table rows: Department Name, Total Champs, Avg AI Score, Completion %, Active Users (last 14 days), At-Risk Users
- Adoption trend (bar chart, department vs champ count)
- Empty state if no department data

**Data sources:** `users` table (department, ai_score, current_week, last_active)

---

### Tab 3: Projects
**Purpose:** Track all AI projects being built across the company.

**Features:**
- Filter bar: by Team, Status (Idea / In Progress / Completed), search by project name
- Project cards/table: Employee, Team, Project Name, Status badge, Impact (free text from submission)
- Status counts summary at top (total Idea / In Progress / Completed)
- Empty state if no submissions

**Data sources:** `submissions` table (current_project, department, status if present)

---

### Tab 4: Risk Centre
**Purpose:** Auto-surface struggling users so admins never have to hunt manually.

**Auto-flag criteria:**
| Flag | Condition |
|------|-----------|
| Incomplete Onboarding | `onboarding_complete = false` |
| Inactive 14+ Days | `last_active < now() - 14 days` |
| Roadmap Stalled | `current_week` hasn't changed in 14 days |
| Low Engagement | `ai_score < 4` AND no recent submission |

**Features:**
- Summary: total flagged users, breakdown by flag type
- Table: Name, Department, Flag Type, Days Since Active, quick actions
- Quick actions per row: Send Reminder (copies email), Mark Reviewed (dismisses from list), Schedule Support (opens mailto)
- Filter by flag type
- Empty state ("No users at risk — great work!")

**Data sources:** `users` table, `risk_flags` table (if present), `submissions` table

---

### AI Insights Tab (existing — enrich only)
Add an executive summary section at the top:
- Most active teams
- Teams needing support  
- Common blockers (from submission text)
- Top 3 AI Champions
- Recommended actions (AI-generated via existing `/api/insights` route)

No structural changes to the existing tab — prepend a `GlassCard` summary block.

---

## 3. Global Features

- **Search:** available in Champion View and Projects tab
- **Filters:** Team, Archetype, Risk type, Progress — per tab where relevant
- **Export CSV:** Projects and Risk Centre tabs get an export button (reuse existing Export tab logic)
- **Responsive:** sidebar collapses on mobile (existing behaviour), tab content stacks on small screens
- **Loading states:** per-tab skeletons using existing `Skeleton` component pattern
- **Empty states:** using existing `EmptyState` component

---

## 4. Access Restriction

Update `src/app/admin/layout.tsx` (or middleware) to check `session.user.email` against an allowlist:

```ts
const ADMIN_EMAILS = [
  's@wrd.co.in',
  'mitchelle@wrd.co.in',
  'siddhantsethi@wrd.co.in',
  'yashvigotecha@wrd.co.in',
  'drishtiparyani@wrd.co.in',
]
```

These are hardcoded. To add/remove someone, update this list in `src/app/admin/layout.tsx`.

Redirect non-matching authenticated users to `/dashboard`.

---

## 5. Architecture

- All new tabs follow existing pattern: `src/components/admin/tabs/<TabName>.tsx`
- No new API routes needed for V1 — all data fetched client-side from Supabase directly
- No schema changes — work with existing tables; degrade gracefully where columns may be absent
- Reuse: `GlassCard`, `GradientBadge`, `Skeleton`, `EmptyState` from `src/components/ui/`
- Charts: Recharts (already installed, used in Overview)

---

## 6. File Plan

```
src/components/admin/tabs/
  ChampionView.tsx       (new)
  TeamView.tsx           (new)
  Projects.tsx           (new)
  RiskCentre.tsx         (new)

src/app/admin/
  page.tsx               (update TABS array + switch case)
  layout.tsx             (update access restriction)
```

---

## 7. Out of Scope (V1)

- Real-time updates (polling/websockets)
- Email sending (Send Reminder = mailto link only)
- Bulk actions
- Custom date range filters
- Mobile-specific navigation changes
- New Supabase tables or migrations
