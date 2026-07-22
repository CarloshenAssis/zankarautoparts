import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function uploadProductImage(file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function uploadStoreLogo(file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const ext = file.name.split(".").pop() ?? "png";
  const path = `logo.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(`store/${path}`, file, {
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(`store/${path}`);
  return data.publicUrl;
}
