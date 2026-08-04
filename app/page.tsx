import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Hero } from "@/components/marketing/Hero";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PreviewSection } from "@/components/marketing/PreviewSection";
import { AudienceSection } from "@/components/marketing/AudienceSection";
import { StatusSection } from "@/components/marketing/StatusSection";
import { CtaSection } from "@/components/marketing/CtaSection";

// Signed-in visitors are redirected to /brief by middleware before this
// ever renders (same pattern as /login and /signup) — this only ever
// renders for signed-out visitors. The real, read-only progress page
// (formerly at this route) lives at /progress now.
export default function RootPage() {
  return (
    <main className="min-h-screen bg-background">
      <MarketingNav />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <PreviewSection />
      <AudienceSection />
      <StatusSection />
      <CtaSection />
    </main>
  );
}
