import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type TReqSignInWithPassword = {
  email: string;
  password: string;
};

export type TAuthStateChangeHandler = (
  event: AuthChangeEvent,
  session: Session | null,
) => void;

export async function getCurrentSession() {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();

  return data.session;
}

export function subscribeToAuthChanges(handler: TAuthStateChangeHandler) {
  const supabase = getSupabaseBrowserClient();

  return supabase.auth.onAuthStateChange(handler);
}

export async function signInWithPassword({ email, password }: TReqSignInWithPassword) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    throw error;
  }
}

export async function checkAllowedUser() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("is_allowed_user");

  if (error) {
    throw error;
  }

  return data === true;
}
