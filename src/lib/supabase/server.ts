import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getCookies, setCookie } from "@tanstack/react-start/server";

/**
 * SSR-aware Supabase client: reads/writes the auth session via cookies, so
 * loaders/server functions see the same session as the browser. RLS applies
 * normally (runs as `anon` or `authenticated`, never bypasses policies).
 */
export function createSupabaseServerClient() {
  return createServerClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookies = getCookies();
          return Object.entries(cookies).map(([name, value]) => ({ name, value: value ?? "" }));
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptionsWithName }[]) {
          for (const { name, value, options } of cookiesToSet) {
            setCookie(name, value, options);
          }
        },
      },
    },
  );
}

/**
 * Service-role client — bypasses RLS entirely. Server-only (the key is not
 * VITE_-prefixed, so it never reaches the client bundle). Use sparingly, only
 * for operations that legitimately need to act outside a user's own scope
 * (e.g. provisioning a customer auth account from the admin panel).
 */
export function createSupabaseServiceClient() {
  return createClient(import.meta.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
