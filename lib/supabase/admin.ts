import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Service-role Supabase client — bypasses RLS entirely. Server-only: the
 * key this reads is NOT prefixed NEXT_PUBLIC_ and must never be imported
 * from a "use client" file. Only use this where the caller explicitly
 * curates which fields are safe to expose (e.g. the public progress page),
 * never as a shortcut around RLS for authenticated-user data.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
