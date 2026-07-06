const requiredPublicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

type PublicEnv = {
  supabaseUrl: string;
  supabasePublishableKey: string;
};

export function getPublicEnv(): PublicEnv {
  const missing = Object.entries(requiredPublicEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing public environment values: ${missing.join(", ")}`);
  }

  return {
    supabaseUrl: requiredPublicEnv.supabaseUrl as string,
    supabasePublishableKey: requiredPublicEnv.supabasePublishableKey as string,
  };
}
