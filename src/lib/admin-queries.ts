import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminOrderItem = {
  id: string;
  product_name_snapshot: string;
  product_sku_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
};

export type AdminOrder = {
  id: string;
  order_number: string;
  status: string;
  channel: string;
  guest_name: string | null;
  guest_phone: string | null;
  total: number;
  notes: string | null;
  created_at: string;
  items: AdminOrderItem[];
  customer: { name: string; phone: string | null } | null;
};

export const getOrders = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminOrder[]> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
      id, order_number, status, channel, guest_name, guest_phone, total, notes, created_at,
      items:order_items ( id, product_name_snapshot, product_sku_snapshot, unit_price_snapshot, quantity, line_total ),
      customer:customers ( name, phone )
    `,
      )
      .order("created_at", { ascending: false });
    if (error) throw error;

    type OrderRow = Omit<AdminOrder, "total" | "customer"> & {
      total: number | string;
      customer: { name: string; phone: string | null }[] | null;
    };

    return ((data ?? []) as unknown as OrderRow[]).map((row) => ({
      id: row.id,
      order_number: row.order_number,
      status: row.status,
      channel: row.channel,
      guest_name: row.guest_name,
      guest_phone: row.guest_phone,
      total: Number(row.total),
      notes: row.notes,
      created_at: row.created_at,
      items: row.items ?? [],
      customer: row.customer?.[0] ?? null,
    }));
  },
);

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator((input: { orderId: string; status: string; note?: string }) => input)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.orderId);
    if (updateError) throw updateError;

    const { error: historyError } = await supabase
      .from("order_status_history")
      .insert({ order_id: data.orderId, status: data.status, note: data.note ?? null });
    if (historyError) throw historyError;

    return { ok: true };
  });
