import { PublicProgress } from "@/components/public/PublicProgress";

// Signed-in visitors are redirected to /brief by middleware before this
// ever renders (same pattern as /login and /signup) — this component only
// ever runs for signed-out visitors.
export default function RootPage() {
  return <PublicProgress />;
}
