import { notFound } from "next/navigation";
import { ReviewSidebar } from "@/components/review/ReviewSidebar";
import { ReviewBanner } from "@/components/review/ReviewBanner";
import { MobileReviewNav } from "@/components/review/MobileReviewNav";
import { MobileTopBar } from "@/components/layout/MobileTopBar";

export default async function ReviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Constant-shape 404 on mismatch — doesn't hint "close but wrong" the way
  // a redirect or an error message would.
  if (!process.env.REVIEW_ACCESS_TOKEN || token !== process.env.REVIEW_ACCESS_TOKEN) {
    notFound();
  }

  return (
    <div className="flex">
      <ReviewSidebar token={token} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="flex-1 overflow-y-auto bg-background pb-16 md:pb-0">
          <ReviewBanner />
          {children}
        </main>
      </div>
      <MobileReviewNav token={token} />
    </div>
  );
}
