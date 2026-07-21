export function productImageUrl(storagePath: string) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${storagePath}`;
}
