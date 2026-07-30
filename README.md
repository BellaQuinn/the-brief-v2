# The Brief

Mission Control for ambitious nontraditional students.

## What's built (this pass)

- **Database** — `database/schema.sql`: all nine tables from the DB design, enums for every status field, RLS policies so a user can only ever touch their own rows (cascading through the degree → term → course → assignment chain), `updated_at` triggers, and an auth hook that creates a `public.users` row on signup.
- **Types** — `types/database.types.ts`, hand-matched to the schema. Swap for generated types once the project is live in Supabase.
- **Supabase clients** — browser client, server client (Server Components / Actions), and a middleware session refresher that redirects signed-out users to `/login` and signed-in users away from `/login` and `/signup`.
- **Design system** — `tailwind.config.ts` + `app/globals.css`: dark background, restrained blue ("signal") for interactive elements, gold ("seal") reserved for the active-nav rail and priority flags only. Space Grotesk for display, Inter for body, IBM Plex Mono for the eyebrow/data labels — the one deliberate nod to the "cybersecurity meets modern legal" brief, used sparingly rather than as a terminal theme.
- **App shell** — sidebar nav (`components/layout/Sidebar.tsx`) with the five finalized sections, a shared `WorkspaceHeader` every workspace opens with, and a `(dashboard)` route group layout that fetches the user server-side.
- **Auth** — working login and signup pages wired to Supabase Auth.
- **The Brief dashboard** (`app/(dashboard)/brief/page.tsx`) — the actual mission briefing. Queries `assignments` directly (joined to `courses`) for what's due today and in the next 7 days, plus glanceable stats (open applications, certifications in motion). This is the single-source-of-truth pattern the rest of the app follows: nothing here is a separate cache of assignment data.
- **Academics / Career / Resources / Settings** — placeholder pages using the same header pattern, ready to be built out next.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
```

In Supabase: SQL Editor → paste and run `database/schema.sql`. Then:

```bash
npm run dev
```

## Suggested build order from here

1. **Academics workspace** — Degree Plan → Terms → Courses → Assignments CRUD. Everything else in the app reads from what gets built here.
2. **Career workspace** — Certifications, Job Applications (kanban-style by `status`), Networking, Resume.
3. **Resources** — searchable library, filterable by category.
4. **Settings** — profile, timezone, password.
5. Notifications / calendar / AI recommendations — deferred to a later version per the brief.

## Notes for whoever picks this up next

- Everything is server-rendered where possible; forms that mutate data are the client components.
- No `localStorage`/client-only state for anything that belongs in Supabase — RLS is the trust boundary, not the UI.
- Keep the gold accent rare. It should still feel like a seal, not a highlight color, once more screens exist.
