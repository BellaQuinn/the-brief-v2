import { GuideContent } from "@/components/public/GuideContent";

// Public and always accessible (see ALWAYS_ACCESSIBLE_ROUTES in
// lib/supabase/middleware.ts) -- unlike /login or /progress, a signed-in
// operator is not redirected away from this page, since it's meant to be
// reachable from inside the app too.
export default function GuidePage() {
  return <GuideContent />;
}
