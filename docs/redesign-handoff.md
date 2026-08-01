# Design System 2.0 — handoff

Status as of 2026-08-01, end of session. Branch `redesign-v2`, pushed to `origin/redesign-v2` (4 commits ahead of the point it branched from `main`). **Not merged to `main`.** Live preview: Vercel auto-deploys `redesign-v2` as a Preview Deployment (see "Deploy" below for the URL and the auth-protection gotcha).

Read `docs/design-philosophy.md` first — it's the durable rulebook (Brand Principles, Intelligence Console, Hacker DNA, Mission First, Silence Is a Feature, The Brief's Voice, locked phrases, Momentum's real basis) that every change below was checked against, and that any future work should be checked against too. This file is the "what got built and what's left" companion to that.

## How we got here

This was a multi-round design exploration, not a single spec handed off:

1. Original ask was a full visual/interaction evolution ("Design System 2.0") — evolve the terminal/CRT identity into something calmer and more premium, without changing functionality, routes, or data flows.
2. First implementation pass (commit `56245bf`, "Foundation") was too conservative — new color tokens and fonts, but the same layout. User feedback: *"this looks exactly the same just diff color."*
3. Iterated through **three mockup concepts** (Mission Deck / Command Grid / Field Notes) built as standalone HTML artifacts, reviewed live, then **five refinement rounds** on the combined direction — pushing the Mission Brief to be the dominant element, giving instrument modules a corner-bracket "equipment" identity instead of card styling, dialing back an overly loud status word, fixing a real SVG-text-centering bug found during review.
4. Once the visual language was approved, the ask shifted from styling to **identity/narrative**: *"The product should feel like it's actively briefing me rather than simply presenting information."* This produced The Brief's Voice (six rules, now in `docs/design-philosophy.md`) and a from-mockup "signature moments" demo (the Briefing Compile animation, an All-Clear alternate state, a rewritten boot sequence).
5. Implementation then proceeded in three real commits, each planned and verified separately (vitest + production build + browser check every time):
   - `4fd8dc2` — the compiled Mission Brief itself.
   - `5332200` — instrument modules (replacing the plain stat-tile row) + the OS-panel sidebar treatment.
   - `14e635e` — Momentum, which was deliberately left unbuilt in the first two commits until it could be backed by a real computation.

## What's actually built (only the Brief dashboard + sidebar)

**`app/(dashboard)/brief/page.tsx`** — rewritten. Fetches full `applications`/`certifications` rows (not just counts) plus a 14-day-lookback assignments query, and composes:
- `<MissionBrief>` — replaces the old `WorkspaceHeader` on this page only. Four-to-six-line "briefing compile" animation (status → greeting → situation → directive → optional Momentum), each line resolving in sequence on mount, skipped under `prefers-reduced-motion`.
- An instrument row: `TicketModule` (due today), `TrackerModule` (application pipeline, real 4-stage grouping), `GaugeModule` ×2 (GPA, certification countdown) — all corner-bracket-framed, no plain card borders. Responsive via `flex-wrap` + `min-width`/`flex-basis`, not fixed widths (a real overflow bug was caught and fixed here at in-between desktop widths, ~800–900px).

**New `lib/` modules** (all pure functions, all unit-tested — 47 tests total across the whole suite):
- `lib/missionBrief.ts` — status/situation/directive computation. Every claim is checkable against real data (e.g. "nothing urgent" only said when true).
- `lib/applicationPipeline.ts` — groups the real 7-status application enum into 4 display stages.
- `lib/certifications.ts` — nearest upcoming exam date; returns `null` (rendered as an honest empty state) when nothing qualifies.
- `lib/momentum.ts` — 14-day assignment-completion-rate signal; also returns `null` with zero data points, and the Mission Brief omits the line entirely rather than showing a placeholder.
- `lib/utils.ts` gained `parseDateOnly` (extracted — was duplicated three times) for plain `date` columns. Important distinction learned this session: `assignments.due_date` is `timestamptz` (already timezone-aware, use plain `new Date()`), while `exam_date`/`application_deadline`/`deadline`/`lsat_planned_test_date` are plain `date` columns (need `parseDateOnly` to avoid the UTC-midnight-rollback bug). Mixing these up is an easy, silent mistake — it happened once this session and was caught via a test using an unrealistic fixture.

**`components/layout/Sidebar.tsx`** — purely additive: same nav items/hrefs/active-state/sign-out. Added a live local-clock strip, a tiny mono "designation" under each real nav label (Academics → *Academic Intelligence*, etc. — no invented IA), a small reticle-bracket frame on the active icon (same visual motif as the instrument modules), richer (explicitly still flavor-text) system log content.

**`app/globals.css`** — added `.instrument-frame` (+ 4 color variants) and `.nav-frame-active`, following the same plain-CSS-class pattern `.eyebrow` already established.

**`components/layout/BootSequence.tsx`** — copy only changed, to describe what it's actually doing.

**Explicitly NOT touched**: `StatTile`/`GpaCard` components (still used by `app/review/[token]/brief/page.tsx`, the Portfolio Preview page), `MobileNav.tsx` (bottom tab bar — the OS-panel concept doesn't translate there), `WorkspaceHeader.tsx` (still used by every page except the private Brief page).

## What's NOT built yet — next session

**The user's explicit next priority: LSAT, Planner, Assignments, Courses.** Before starting, confirm which of these means "apply Design System 2.0's visual language" vs. "there's still missing functionality" — `README.md`'s original build-order notes list Planner/Courses/Assignments as sub-nav tabs that were at one point "sketched but inert" placeholders inside Academics, but Courses/Assignments CRUD was also one of the very first things built in this project. Don't assume; check the current state of those specific routes/components first, since this memory may be stale on that point.

Beyond that explicit list, the rest of Design System 2.0's rollout is still open:
- Every other page still renders with the *old* `WorkspaceHeader`/`StatTile` visual system: Academics Overview, Academic Standing, Career, Resources, Settings, Calendar, and every Graduate & Law School tab (Schools, Applications, Scholarships, Timeline, Documents) except whatever LSAT work happens next.
- The instrument-module system (corner-bracket framing, gauges) and the sidebar's designation/reticle treatment exist now as a proven pattern — rolling them out elsewhere should be largely mechanical, reusing `TicketModule`/`TrackerModule`/`GaugeModule`/`.instrument-frame` rather than inventing new per-page treatments.
- Momentum currently only draws on assignment completion. If it's ever extended to weigh application-pipeline movement or certification progress, each new signal needs its own real, checkable basis — same rule as everything else (see `docs/design-philosophy.md`).

## Deploy / access note

`redesign-v2`'s Vercel Preview Deployment was initially blocking direct access behind Vercel Authentication (a default that applies to Preview deployments, not Production — this is why the very first, `main`-branch deployment never needed a login and this one did). Fixed by changing **Project Settings → Deployment Protection**'s Vercel Authentication scope so it no longer covers Preview deployments. Production (`main`) was never affected either way.

## Working elsewhere (e.g. Codex)

This file plus `docs/design-philosophy.md` should be enough context to keep working on this branch without re-deriving the last several days of design decisions. The branch is pushed, so any environment can `git checkout redesign-v2` directly. Keep following this session's pattern: plan before large changes, verify with `npx vitest run` + a clean `npm run build` + a browser check before calling something done, commit to `redesign-v2` only, never merge to `main` without explicit review, never push without explicit confirmation.
