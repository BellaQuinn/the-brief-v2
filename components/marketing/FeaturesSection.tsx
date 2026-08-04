import {
  Bell,
  Calculator,
  Calendar,
  FileText,
  GraduationCap,
  Link2,
  Scale,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Academic Standing",
    description:
      "GPA, honors progress, and honor-society eligibility computed automatically from grades you enter once — every number shows its own math, not just a headline figure.",
  },
  {
    icon: Calendar,
    title: "Calendar",
    description:
      "Assignment due dates, certification exams, applications, and LSAT dates in one display-only view — a real picture of what's coming, never a place records get edited from.",
  },
  {
    icon: Scale,
    title: "Graduate & Law School",
    description:
      "Schools, applications, scholarships, and a real milestone roadmap for the path toward a JD — nested alongside everything else, not a separate tool.",
  },
  {
    icon: FileText,
    title: "Documents + Syllabus Intelligence",
    description:
      "Upload a syllabus and review AI-proposed assignments one at a time — accept, edit, or dismiss each. Nothing gets written to your real record without you saying so.",
  },
  {
    icon: Calculator,
    title: "Scenario Planner",
    description:
      "\"What grade do I need on the final\" answered instantly from your real numbers — including an honest ceiling when a target genuinely isn't reachable.",
  },
  {
    icon: Sparkles,
    title: "LSAT study plans",
    description:
      "Section-by-section trend analysis and goal-gap checkpoints, with AI-proposed study tasks you review and accept individually into your real plan.",
  },
  {
    icon: Bell,
    title: "Push notifications",
    description:
      "Reminders at 3 days, 24 hours, and day-of — before a deadline lands, not after. Works on desktop and, once added to your Home Screen, on iPhone.",
  },
  {
    icon: Link2,
    title: "Portfolio Preview",
    description:
      "A shareable, read-only link for an advisor or mentor to see real progress — without ever handing them your login.",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-b border-border-subtle px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="eyebrow">What's actually built</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-primary md:text-4xl">
            Eight systems, one operator.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            Every item below is live in the product today — not a mockup, not a roadmap slide.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-card border border-border-subtle bg-surface p-5">
              <feature.icon className="h-5 w-5 text-signal" aria-hidden />
              <h3 className="mt-4 text-sm font-medium text-ink-primary">{feature.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-tertiary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
