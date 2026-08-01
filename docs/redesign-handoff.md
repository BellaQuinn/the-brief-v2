# Design System 2.0 — Claude handoff

Status: 2026-08-01. Active branch: `redesign-v2`, tracking `origin/redesign-v2`. Application work is pushed through commit `97e667d` (`feat: brief every existing workspace`). The branch has **not** been merged to `main`.

Read [`docs/design-philosophy.md`](./design-philosophy.md) before changing a screen. It is the durable rulebook. This document records the current implementation and the intended next work.

## What the redesign became

The missing product-level idea was not a color palette or a component library. It was this:

> Every workspace should brief the user before presenting the workspace.

The opening sequence is now:

1. Orient the user.
2. State the current situation in plain language.
3. Name exactly one next action.
4. Transition into the detailed workspace.

The brief must be computed from real data. Quiet states stay quiet. No invented urgency, synthetic confidence, filler statistics, or claims that exceed the schema.

## Current application state

The following real workspaces have contextual briefs:

- The Brief dashboard
- Calendar
- Academics Overview
- Academic Standing
- Graduate & Law School Overview
- Schools
- LSAT
- Applications
- Scholarships
- Timeline
- Graduate & Law School Documents
- Career
- Resources
- Settings

No live application route still opens with the old conventional `WorkspaceHeader`. The component remains in the repository but is no longer used by a live workspace.

### Workspace identities already established

- **The Brief:** compiled Mission Brief and instrumentation. This is the signature product moment.
- **Calendar:** schedule surface. Mobile remains a contained single-column calendar; desktop is a constrained two-column composition with the month grid primary and selected-day detail secondary.
- **Academics Overview:** program schematic, credit track, term stations, course traces, and assignment branches.
- **Academic Standing:** GPA position, course evidence rail, honors thresholds, and eligibility matrix.
- **LSAT:** score telemetry, goal line, test window, and performance record.
- **Career:** credential signal, opportunity pipeline, relationship trace, and resume dossier.
- **Resources:** searchable intelligence archive and indexed records.
- **Settings:** operator identity and security configuration console.
- **Graduate & Law School:** all tabs now brief correctly, but several detailed surfaces below the brief still use older card treatments. Do not mistake “briefing layer complete” for “every detailed Law School component fully visually evolved.”

Different metaphors are intentional. What must remain consistent is the shared visual grammar: type hierarchy, section cadence, open measurement fields, trace rails, line weight, coordinates, interaction states, responsive color treatment, and The Brief's Voice.

## Shared implementation primitives

### `components/layout/WorkspaceBrief.tsx`

The default opening component for a workspace. It takes:

- `eyebrow`
- `status`
- `situation`
- `directive`
- optional `meta`
- optional `action`

New workspaces should use this unless there is a compelling product reason not to. A static page title and subtitle are not a substitute.

### `components/layout/WorkspaceSection.tsx`

Shared section rhythm: eyebrow, section title, optional action, then content. Use it to keep detailed workspaces related without forcing identical layouts.

### `lib/workspaceBriefs.ts`

Pure, tested builders for every contextual brief. Add a builder here for Planner, Courses, and Assignments. The builder should receive the smallest truthful set of derived facts and return `{ status, situation, directive }`.

Tests live in `lib/workspaceBriefs.test.ts`. Important branches include empty data, active work, completed work, missing configuration, and real urgency.

### Shared CSS in `app/globals.css`

- `.workspace-header-treatment` — mobile explicitly moves green on the left into blue on the right; desktop preserves the same direction with more space.
- `.brief-header-treatment` — green-led treatment reserved for The Brief/Mission Control.
- `.signal-field` / `.signal-field-accent` — open quantitative field with measurement grid and calibration line.
- `.trace-rail`, `.trace-node`, `.trace-connector` — shared branching language for courses, evidence, requirements, and records.
- `.instrument-frame` variants — open-corner instrumentation used by the dashboard.
- `.nav-frame-active` — active navigation reticle.
- `.eyebrow` — shared classification label with readable contrast.

Do not regress these into generic rounded cards. Forms and discrete editable objects may still need bounded controls, but the page should not become a wall of independent rectangles.

## Responsive decisions that are already settled

- Mobile workspace headers must preserve the desktop green-to-blue transition; they must not collapse to black or become uniformly blue.
- The Brief is intentionally green-led on both desktop and mobile. `MobileTopBar` is route-aware for `/brief`, and the full Mission Brief message field uses `.brief-header-treatment`.
- The Calendar mobile structure is the reference implementation. Do not disrupt its single-column order.
- Calendar desktop should remain constrained, with the month grid as the primary surface and selected-day detail as the secondary panel.
- All evolved pages were checked at 390px without page-level horizontal overflow. Internal horizontal scan lanes, such as pipelines, may scroll intentionally.
- Workspace labels use the higher-contrast secondary ink token.

## Data and voice rules that must not be lost

- `lib/missionBrief.ts` computes the dashboard status, situation, and directive.
- `lib/momentum.ts` uses the real completion rate of assignments due in the last 14 days. With no qualifying assignments it returns `null`, and the line is omitted.
- `lib/operatorTime.ts` derives the greeting and displayed day from the operator's saved timezone. Do not use the server's local hour.
- `lib/calendar.ts` distinguishes `timestamptz` assignment due dates from plain `date` fields.
- Assignments remain the single source of truth; do not duplicate them into Planner or Courses.
- “All clear,” “nothing urgent,” “on track,” and similar statements must be provable from the fetched data.
- Every number needs a plain-language interpretation. Avoid raw metric strips that make the user interpret the status.
- The locked phrase `ready when you are, Operator.` must not be rewritten once shipped.

## What remains to build next

The user's next requested work is the remaining Academics area:

1. Planner
2. Courses
3. Assignments

These tabs currently appear as inert entries in `components/academics/AcademicsSubNav.tsx`; there are no corresponding live page routes under `app/(dashboard)/academics/` yet. The top-level Academics “Documents” tab is also inert, but it was not included in the immediate next request. Do not confuse it with the working Graduate & Law School Documents route.

Before implementing, inspect the existing schema and CRUD components. The Academics Overview already renders real degrees, terms, courses, and lazily loaded assignments through components such as:

- `components/academics/AcademicsClient.tsx`
- `components/academics/DegreeSection.tsx`
- `components/academics/TermSection.tsx`
- `components/academics/CourseRow.tsx`
- `components/academics/AssignmentRow.tsx`

Planner, Courses, and Assignments should be alternate operational views over the same records, not new stores of duplicated data.

### Definition of done for each new Academics workspace

- A tested contextual brief appears first.
- The status is backed by real records and handles zero data honestly.
- Exactly one next action is named.
- The detailed surface has its own useful metaphor, while using the shared system grammar.
- Existing CRUD behavior and relationships are preserved.
- No filler cards or invented statistics are added to make a quiet screen look busy.
- Desktop and 390px mobile are visually reviewed.
- No page-level horizontal overflow.
- `npm test`, `npx tsc --noEmit --incremental false`, and `npm run build` pass.

## Verification baseline

At this handoff:

- 73 tests pass across 9 test files.
- TypeScript passes with `npx tsc --noEmit --incremental false`.
- The Next.js production build passes.
- The development server was last restarted on `http://localhost:3000`.

Important workflow detail: stop the development server before running `npm run build`, then restart it afterward. Running the production build against the same `.next` directory while the dev server is active caused stale/corrupt asset behavior during this redesign.

## Git and review discipline

- Continue on `redesign-v2`.
- Do not merge to `main` without explicit user review and approval.
- Do not push without explicit user confirmation.
- Preserve unrelated work in a dirty worktree.
- Use the live signed-in app for visual review; empty and populated states both matter.

Recent relevant commits, newest first:

- `97e667d` — brief every existing workspace
- `18bff12` — use operator timezone for Brief greeting
- `52b327a` — extend mobile Brief color field
- `5340d83` — mirror workspace gradient on mobile
- `0c07c56` — align mobile Brief color scheme
- `7b3c3d4` — refine responsive headers and Calendar
- `366eae9` — extend workspace design system to Career, Resources, and Settings
- `2a20348` — unify Academics, Academic Standing, and LSAT workspace system

## One-sentence brief for the next agent

Build Planner, Courses, and Assignments as new mission-oriented views over the existing academic data: brief the operator first, preserve truth and functionality, give each page a distinct useful metaphor, and make all three feel born into The Brief rather than retrofitted afterward.
