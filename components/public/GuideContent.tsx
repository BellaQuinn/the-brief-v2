import Link from "next/link";

// Static reference content -- no data fetching. Kept in its own
// component (rather than inline in the page) so the page file stays a
// clean routing/metadata shell, matching the pattern of PublicProgress.

const NAV_SECTIONS: { href: string; label: string; sub?: { href: string; label: string }[] }[] = [
  { href: "#getting-started", label: "Getting Started" },
  { href: "#the-brief", label: "The Brief" },
  { href: "#calendar", label: "Calendar" },
  {
    href: "#academics",
    label: "Academics",
    sub: [
      { href: "#academic-standing", label: "Academic Standing" },
      { href: "#planner", label: "Planner" },
      { href: "#courses-assignments", label: "Courses & Assignments" },
      { href: "#grad-law", label: "Graduate & Law School" },
      { href: "#academics-documents", label: "Documents" },
    ],
  },
  {
    href: "#career",
    label: "Career",
    sub: [
      { href: "#applications", label: "Applications" },
      { href: "#certifications", label: "Certifications" },
      { href: "#networking-resume", label: "Networking & Resume" },
    ],
  },
  { href: "#resources", label: "Resources" },
  {
    href: "#settings",
    label: "Settings",
    sub: [
      { href: "#notifications", label: "Notifications" },
      { href: "#portfolio-preview", label: "Portfolio Preview" },
    ],
  },
];

function Signal({
  children,
  color = "signal",
  label,
}: {
  children: React.ReactNode;
  color?: "signal" | "accent" | "seal";
  label: string;
}) {
  const labelColor = color === "accent" ? "text-accent" : color === "seal" ? "text-seal" : "text-signal";
  const accentBg = color === "accent" ? "bg-accent" : color === "seal" ? "bg-seal" : "bg-signal";
  return (
    <div className="signal-field relative my-4 max-w-2xl px-5 py-4">
      <span className={`absolute left-0 top-[-1px] h-px w-12 ${accentBg}`} aria-hidden />
      <p className={`font-mono text-[10px] uppercase tracking-eyebrow ${labelColor}`}>{label}</p>
      <div className="mt-1.5 space-y-2 text-[13.5px] leading-relaxed text-ink-secondary">{children}</div>
    </div>
  );
}

function Sub({ id, tag, title, children }: { id: string; tag?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="my-6 max-w-2xl scroll-mt-6">
      <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink-primary">
        {title}
        {tag && (
          <span className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-tertiary border border-border rounded px-1.5 py-0.5">
            {tag}
          </span>
        )}
      </h3>
      <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-ink-secondary">{children}</div>
    </div>
  );
}

function Path({ children }: { children: string }) {
  return (
    <code className="font-mono text-[12.5px] text-ink-primary bg-surface-raised border border-border rounded px-1.5 py-0.5">
      {children}
    </code>
  );
}

export function GuideContent() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-seal/40 font-mono text-xs font-bold text-seal">
            B
          </span>
          <span className="text-sm font-semibold text-ink-primary">The Brief</span>
        </Link>
        <Link href="/brief" className="text-xs text-ink-secondary hover:text-ink-primary transition-colors">
          Go to Mission Control →
        </Link>
      </header>

      <div className="mx-auto flex max-w-6xl">
        <nav className="sticky top-0 hidden h-screen w-56 shrink-0 overflow-y-auto border-r border-border-subtle px-4 py-8 lg:block">
          {NAV_SECTIONS.map((item) => (
            <div key={item.href} className="mb-1">
              <a
                href={item.href}
                className="block rounded-md px-2.5 py-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface-raised hover:text-ink-primary"
              >
                {item.label}
              </a>
              {item.sub && (
                <div className="ml-3 border-l border-border-subtle pl-3">
                  {item.sub.map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      className="block rounded-md px-2 py-1 text-xs text-ink-tertiary transition-colors hover:text-ink-primary"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <main className="min-w-0 flex-1 px-4 py-10 md:px-8 md:py-12">
          <div className="max-w-2xl">
            <p className="eyebrow">Onboarding // read once, reference forever</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-primary">
              How to actually use The Brief.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
              The Brief connects your coursework, deadlines, applications, certifications, and documents into one
              workspace, so you enter something once and it shows up everywhere it&apos;s relevant. This guide walks
              through every system, in the order you&apos;ll naturally touch them.
            </p>
          </div>

          <section id="getting-started" className="mt-14 scroll-mt-6 border-t border-border-subtle pt-10">
            <p className="eyebrow">Step one</p>
            <h2 className="mt-1 text-xl font-semibold text-ink-primary">Getting started</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
              Everything else in The Brief reads from your academic record, so setting that up first is what makes
              the rest of the app useful immediately instead of showing empty screens.
            </p>

            <Sub id="add-degree" title="Add your degree">
              <p>
                Go to <Path>Academics</Path> and create your first degree — school name, program, expected
                graduation term, and status.
              </p>
              <ol className="list-decimal space-y-1.5 pl-5">
                <li>
                  Click <strong className="text-ink-primary">+ Add Degree</strong> on the Academics overview page.
                </li>
                <li>
                  Set its status to <strong className="text-ink-primary">Active</strong> if you&apos;re currently
                  enrolled — this is what tells the rest of the app which degree to show on your dashboard.
                </li>
                <li>
                  If you&apos;re also tracking a future program (a planned Master&apos;s or JD), add it too and leave
                  it <strong className="text-ink-primary">Planned</strong> — it stays out of your day-to-day view
                  until you activate it.
                </li>
              </ol>
            </Sub>

            <Sub id="add-courses" title="Add terms, then courses">
              <p>
                Inside your degree, add each term (Fall 2026, Spring 2027, etc.), and inside each term, add your
                courses.
              </p>
              <ol className="list-decimal space-y-1.5 pl-5">
                <li>
                  Set a course&apos;s <strong className="text-ink-primary">status</strong> honestly:{" "}
                  <Path>planned</Path> before it starts, <Path>in_progress</Path> once the term begins,{" "}
                  <Path>completed</Path> once it&apos;s graded. A lot of features (Scenario Planner, GPA, Standing)
                  key off this field directly.
                </li>
                <li>Add assignments inside each course as they&apos;re assigned — due date, weight, and priority.</li>
              </ol>
            </Sub>

            <Signal label="Why this matters">
              <p>
                Grades are entered once, at the assignment level, and flow upward automatically: assignment → course
                grade → term GPA → cumulative GPA → honors eligibility. You never re-enter a grade anywhere else in
                the app.
              </p>
            </Signal>
          </section>

          <section id="the-brief" className="mt-14 scroll-mt-6 border-t border-border-subtle pt-10">
            <p className="eyebrow">Your daily entry point</p>
            <h2 className="mt-1 text-xl font-semibold text-ink-primary">The Brief (dashboard)</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
              This is the first screen you should check every day. It&apos;s not a data dump — it&apos;s a short,
              compiled briefing that tells you where you stand and what to do next.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary">
              Every time you open it, it names one status word (
              <strong className="text-ink-primary">All clear</strong> or{" "}
              <strong className="text-ink-primary">On track</strong>), a one-line situation summary, and a single
              directive — the one thing worth doing next. Below that sit compact instruments for your GPA, open
              applications, and upcoming certification exams.
            </p>
            <div className="mt-4 max-w-2xl rounded-lg border border-border bg-surface px-4 py-3 text-[13.5px] text-ink-secondary">
              <strong className="text-ink-primary">If it ever looks unusually quiet:</strong> that&apos;s deliberate.
              A calm day reads as calm — The Brief doesn&apos;t manufacture urgency just to look busy, and it never
              claims something is &quot;on track&quot; without the real numbers behind it.
            </div>
          </section>

          <section id="calendar" className="mt-14 scroll-mt-6 border-t border-border-subtle pt-10">
            <p className="eyebrow">One combined view</p>
            <h2 className="mt-1 text-xl font-semibold text-ink-primary">Calendar</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
              A single month view pulling together assignment due dates, certification exam dates, Graduate &amp; Law
              School deadlines, and networking follow-ups — everything with a real date, in one place.
            </p>
            <div className="mt-4 max-w-2xl rounded-lg border border-border bg-surface px-4 py-3 text-[13.5px] text-ink-secondary">
              Calendar is <strong className="text-ink-primary">display-only</strong> by design. It never becomes a
              second place to edit things — every event links back to where it actually lives (its assignment, its
              application, its exam) so there&apos;s only ever one real copy of any date.
            </div>
          </section>

          <section id="academics" className="mt-14 scroll-mt-6 border-t border-border-subtle pt-10">
            <p className="eyebrow">Six tabs, one record</p>
            <h2 className="mt-1 text-xl font-semibold text-ink-primary">Academics</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
              Academics isn&apos;t one page — it&apos;s several different lenses over the exact same courses and
              assignments you set up earlier. Nothing is duplicated between them; editing something in one tab
              updates every other view instantly.
            </p>

            <div className="mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
              {[
                ["Overview", "Every degree, term, and course at a glance — the full record, regardless of status."],
                ["Academic Standing", "Your real GPA, honors eligibility, and the Scenario Planner. See below."],
                ["Planner", "A ranked “what to work on right now” queue, not another calendar."],
                ["Courses", "Pick one course, see everything about it in one place — grade, assignments, notes."],
                ["Assignments", "The flat, complete list of everything open across every degree, filterable and sortable."],
                ["Graduate & Law School", "Its own nested workspace for pre-admission exam prep. See below."],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-lg border border-border-subtle bg-surface px-3.5 py-3">
                  <p className="text-[13px] font-semibold text-ink-primary">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-tertiary">{desc}</p>
                </div>
              ))}
            </div>

            <Sub id="academic-standing" tag="GPA & honors" title="Academic Standing">
              <p>
                Your cumulative and current-term GPA, computed automatically from real grades — never something you
                type in directly. Below that: honors progress (Dean&apos;s List, graduation honors) and
                honor-society eligibility, each showing exactly which real requirement is met or still outstanding.
              </p>
            </Sub>
            <Signal color="accent" label="Scenario planner">
              <p>
                At the bottom of Academic Standing, set a hypothetical final grade on any course you&apos;re
                currently taking to see what it would do to your cumulative GPA — nothing is saved, it&apos;s purely
                a what-if. Use <strong className="text-ink-primary">Solve for a target</strong> to work backward:
                pick a course and a GPA goal, and it tells you the exact grade you&apos;d need, or gives you an
                honest answer if even an A wouldn&apos;t get you there.
              </p>
            </Signal>

            <Sub id="planner" tag="what to work on now" title="Planner">
              <p>
                Not a second calendar — Planner answers a different question than Calendar or Assignments does. It
                ranks your open work into tiers (Overdue, Do now, Do next, On deck) and always puts one item at the
                top as the single next thing to do.
              </p>
            </Sub>

            <Sub id="courses-assignments" tag="two views, same data" title="Courses & Assignments">
              <p>
                <strong className="text-ink-primary">Courses</strong> is for going deep on one class — its real
                computed grade, its assignments, its notes. <strong className="text-ink-primary">Assignments</strong>{" "}
                is for scanning everything open across every course and degree at once, grouped into Overdue / Due
                this week / Later / No due date / Done.
              </p>
            </Sub>

            <Sub id="grad-law" tag="nested workspace" title="Graduate & Law School">
              <p>
                If you&apos;re planning ahead toward a graduate or law program, this whole section is a
                self-contained pipeline with its own sub-tabs:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong className="text-ink-primary">Overview</strong> — stat summary and upcoming deadlines
                  across everything below.
                </li>
                <li>
                  <strong className="text-ink-primary">Schools</strong> &amp;{" "}
                  <strong className="text-ink-primary">Applications</strong> — one shared record; the kanban is just
                  a status view of the same schools you&apos;re tracking.
                </li>
                <li>
                  <strong className="text-ink-primary">LSAT</strong> — practice test log, per-section (LR/RC/AR)
                  trend stats, goal checkpoints, and an AI-generated study plan you review and accept one task at a
                  time.
                </li>
                <li>
                  <strong className="text-ink-primary">Scholarships</strong> — deadlines and amounts, tracked the
                  same way as applications.
                </li>
                <li>
                  <strong className="text-ink-primary">Timeline</strong> — a milestone roadmap of the whole journey,
                  not a deadline list.
                </li>
                <li>
                  <strong className="text-ink-primary">Documents</strong> — files specific to this track (personal
                  statements, transcripts requested, etc.).
                </li>
              </ul>
            </Sub>

            <Sub id="academics-documents" tag="syllabus intelligence" title="Documents">
              <p>
                Upload a syllabus, transcript, or any academic file here — or attach one directly to a specific
                course, term, or assignment.
              </p>
            </Sub>
            <Signal color="seal" label="Extract assignments from a syllabus">
              <p>
                Tag an uploaded file as a <strong className="text-ink-primary">syllabus</strong> and click{" "}
                <strong className="text-ink-primary">Extract assignments</strong>. The Brief reads it and proposes a
                list of assignments — but nothing is written to your real record automatically. Review each one,
                edit anything that&apos;s off, and accept or dismiss individually. It only becomes a real assignment
                once you say yes.
              </p>
            </Signal>
          </section>

          <section id="career" className="mt-14 scroll-mt-6 border-t border-border-subtle pt-10">
            <p className="eyebrow">Applications, certs, and network — together</p>
            <h2 className="mt-1 text-xl font-semibold text-ink-primary">Career</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
              Everything about your job search and professional credentials lives on one page, in three connected
              sections.
            </p>

            <Sub id="applications" tag="kanban" title="Applications">
              <p>
                Track each opportunity through real stages: <Path>Saved → Applied → Phone Screen → Interviewing → Offer</Path>{" "}
                (or Rejected/Withdrawn). The Brief dashboard&apos;s open-application count and Calendar&apos;s
                follow-up reminders both read straight from this same list.
              </p>
            </Sub>

            <Sub id="certifications" tag="practice tracking + AI study plans" title="Certifications">
              <p>
                Add a certification you&apos;re pursuing (PMP, a CompTIA exam, anything) with its exam date and
                passing score if there is one. Expand any certification card to log practice test scores by domain
                and see your trend — improving, flat, or declining, based on your real results.
              </p>
            </Sub>
            <Signal label="Generate a study plan">
              <p>
                Once you&apos;ve logged a couple of practice tests, click{" "}
                <strong className="text-ink-primary">Generate study plan</strong>. It reads your actual domain
                scores and trend and proposes specific study tasks with its reasoning shown — again, reviewed and
                accepted individually, never auto-added.
              </p>
            </Signal>

            <Sub id="networking-resume" title="Networking & Resume">
              <p>
                <strong className="text-ink-primary">Networking</strong> logs your contacts and when you&apos;re due
                to follow up with each one — those follow-ups also show on Calendar.{" "}
                <strong className="text-ink-primary">Resume</strong> holds one current resume file as your source of
                record for applications.
              </p>
            </Sub>
          </section>

          <section id="resources" className="mt-14 scroll-mt-6 border-t border-border-subtle pt-10">
            <p className="eyebrow">Your reference library</p>
            <h2 className="mt-1 text-xl font-semibold text-ink-primary">Resources</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
              A personal, searchable shelf for anything worth saving that isn&apos;t tied to one specific course or
              application — books, articles, templates, links, courses. Filter by type, search by title, and star
              your most-used ones as favorites.
            </p>
          </section>

          <section id="settings" className="mt-14 scroll-mt-6 border-t border-border-subtle pt-10">
            <p className="eyebrow">Configuration</p>
            <h2 className="mt-1 text-xl font-semibold text-ink-primary">Settings</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
              Your profile, password, and two features worth knowing about specifically:
            </p>

            <Sub id="notifications" tag="push reminders" title="Notifications">
              <p>
                Turn on push notifications here to get reminders at 3 days out, 24 hours out, and the day something
                is due — across assignments, certification exams, and every Graduate &amp; Law School date. Works on
                desktop Chrome, and on iPhone once you add The Brief to your Home Screen (Safari&apos;s Share menu →
                Add to Home Screen).
              </p>
            </Sub>

            <Sub id="portfolio-preview" tag="shareable, read-only link" title="Portfolio Preview">
              <p>
                Generates a private link you can hand to an advisor, mentor, or anyone else you want to show your
                real progress to — without ever giving them your login. It shows your Brief, Academics, Academic
                Standing, Career, and Resources exactly as they are, read-only. Copy or open the link straight from
                the Settings page.
              </p>
              <div className="mt-3 rounded-lg border border-border bg-surface px-4 py-3 text-[13.5px]">
                <strong className="text-ink-primary">Not included:</strong> Graduate &amp; Law School, Planner, and
                anything in Documents stay private — Portfolio Preview only ever shows what&apos;s meant to be
                shown.
              </div>
            </Sub>
          </section>

          <div className="mt-16 max-w-2xl border-t border-border-subtle pt-6 text-xs text-ink-tertiary">
            The Brief keeps evolving — if a screen ever looks different from what&apos;s described here, the app
            itself is the source of truth. This guide gets updated alongside it.
          </div>
        </main>
      </div>
    </div>
  );
}
