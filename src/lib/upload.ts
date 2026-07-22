import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

// Phone photos routinely come in at 5-15MB / 4000px+. Uploading those as-is
// balloons Storage egress every time a product page or catalog card renders
// the image. Downscale + re-encode as JPEG client-side before upload; keep
// the original if compression didn't actually shrink it (e.g. small PNGs
// with transparency, or already-compressed images).
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}

export async function uploadProductImage(file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const compressed = await compressImage(file);
  const ext = compressed.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, compressed, {
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
