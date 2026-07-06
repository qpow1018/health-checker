import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { supabaseUrl, supabasePublishableKey } = getPublicEnv();

  browserClient = createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
