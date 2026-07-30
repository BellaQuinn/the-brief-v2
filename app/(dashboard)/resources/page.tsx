import { createClient } from "@/lib/supabase/server";
import { ResourcesClient } from "@/components/resources/ResourcesClient";
import type { Resource } from "@/types/database.types";

export default async function ResourcesPage() {
  const supabase = await createClient();

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .order("favorite", { ascending: false })
    .order("created_at", { ascending: false });

  return <ResourcesClient initialResources={(resources as Resource[]) ?? []} />;
}
