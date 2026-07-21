import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function createGuestOrder(params: {
  items: { productId: string; quantity: number }[];
  guestName: string;
  guestPhone: string;
  notes?: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("create_guest_order", {
    p_items: params.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
    p_guest_name: params.guestName,
    p_guest_phone: params.guestPhone,
    p_notes: params.notes ?? null,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row as { order_id: string; order_number: string; total: number };
}
