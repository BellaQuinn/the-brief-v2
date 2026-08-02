import { createClient } from "@/lib/supabase/server";
import { ResourcesClient } from "@/components/resources/ResourcesClient";
import type { Resource } from "@/types/database.types";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const supabase = await createClient();

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .order("favorite", { ascending: false })
    .order("created_at", { ascending: false });

  return <ResourcesClient initialResources={(resources as Resource[]) ?? []} />;
}
