import { getStoreSettings } from "@/lib/queries";

// SiteHeader renders on every page — cache the logo lookup in-memory per
// browser session instead of hitting the server function (and Supabase)
// again on every mount/navigation.
let cachedLogoUrl: Promise<string | undefined> | undefined;

export function getCachedLogoUrl(): Promise<string | undefined> {
  if (!cachedLogoUrl) {
    cachedLogoUrl = getStoreSettings()
      .then((settings) => settings?.logo_url ?? undefined)
      .catch(() => undefined);
  }
  return cachedLogoUrl;
}
