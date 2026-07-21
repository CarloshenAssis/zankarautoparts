import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://zankar.com.br";

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(loc: string, lastmod?: string, changefreq?: string, priority?: string): string {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : "",
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : "",
    priority ? `    <priority>${priority}</priority>` : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateSitemapXml(): Promise<string> {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  );

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("status", "active"),
    supabase.from("categories").select("slug"),
  ]);

  const entries: string[] = [
    urlEntry(SITE_URL, undefined, "daily", "1.0"),
    urlEntry(`${SITE_URL}/catalogo`, undefined, "daily", "0.9"),
  ];

  for (const cat of categories ?? []) {
    entries.push(urlEntry(`${SITE_URL}/catalogo?cat=${cat.slug}`, undefined, "weekly", "0.6"));
  }

  for (const p of products ?? []) {
    entries.push(urlEntry(`${SITE_URL}/produto/${p.slug}`, p.updated_at, "weekly", "0.8"));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}
