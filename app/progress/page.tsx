import { PublicProgress } from "@/components/public/PublicProgress";

// Signed-in visitors are redirected to /brief by middleware before this
// ever renders (same pattern as /login and /signup) — this component only
// ever runs for signed-out visitors. Formerly the root route — moved here
// once "/" became the marketing landing page.
export default function ProgressPage() {
  return <PublicProgress />;
}
