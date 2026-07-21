import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Search, Filter } from "lucide-react";
import { useState } from "react";
import { formatBRL } from "@/lib/types";
import { getOrders, updateOrderStatus, type AdminOrder } from "@/lib/admin-queries";

export const Route = createFileRoute("/admin/pedidos")({
  loader: async () => ({ orders: await getOrders() }),
  component: PedidosPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending_whatsapp: "Novo",
  confirmed: "Em atendimento",
  processing: "Em atendimento",
  shipped: "Em atendimento",
  delivered: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_BADGE: Record<string, string> = {
  pending_whatsapp: "bg-primary/20 text-primary",
  confirmed: "bg-yellow-500/20 text-yellow-400",
  processing: "bg-yellow-500/20 text-yellow-400",
  shipped: "bg-yellow-500/20 text-yellow-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-muted text-muted-foreground",
};

const statusFilters = ["Todos", "Novo", "Em atendimento", "Concluído", "Cancelado"] as const;

function PedidosPage() {
  const { orders: initialOrders } = Route.useLoaderData();
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("Todos");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    if (filter !== "Todos" && STATUS_LABEL[o.status] !== filter) return false;
    if (
      search &&
      !`${o.order_number} ${o.customer?.name ?? o.guest_name ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  async function advanceStatus(order: AdminOrder) {
    const next: Record<string, string> = {
      pending_whatsapp: "confirmed",
      confirmed: "processing",
      processing: "shipped",
      shipped: "delivered",
    };
    const nextStatus = next[order.status];
    if (!nextStatus) return;
    setUpdating(order.id);
    try {
      await updateOrderStatus({ data: { orderId: order.id, status: nextStatus } });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)));
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pedidos recebidos pelo catálogo — responda pelo WhatsApp
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center rounded-md border border-border bg-input">
            <Search className="ml-3 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente ou número do pedido..."
              className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                  filter === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {orders.length === 0 ? "Nenhum pedido recebido ainda." : "Nenhum pedido encontrado."}
          </p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((o) => {
              const name = o.customer?.name ?? o.guest_name ?? "Cliente";
              const phone = o.customer?.phone ?? o.guest_phone ?? "";
              const digits = phone.replace(/\D/g, "");
              return (
                <div key={o.id} className="p-5">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-lg font-bold">{o.order_number}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[o.status] ?? "bg-muted text-muted-foreground"}`}
                        >
                          {STATUS_LABEL[o.status] ?? o.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {new Date(o.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg font-semibold">{name}</div>
                        <div className="text-sm text-muted-foreground">
                          {phone || "Sem telefone"}
                        </div>
                      </div>

                      <ul className="mt-3 space-y-1 border-l-2 border-primary/40 pl-3 text-sm">
                        {o.items.map((it) => (
                          <li key={it.id} className="flex items-center justify-between gap-4">
                            <span className="truncate">
                              <span className="font-semibold text-primary">{it.quantity}x</span>{" "}
                              {it.product_name_snapshot}
                            </span>
                            <span className="shrink-0 text-muted-foreground">
                              {formatBRL(it.line_total)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {o.notes && (
                        <p className="mt-2 text-xs text-muted-foreground">Obs: {o.notes}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">
                          Total
                        </div>
                        <div className="font-display text-2xl font-bold text-primary">
                          {formatBRL(o.total)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {digits && (
                          <a
                            href={`https://wa.me/55${digits}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-11 items-center gap-2 rounded-md bg-[#25D366] px-4 font-bold text-white transition hover:brightness-110"
                          >
                            <MessageCircle
                              className="h-5 w-5"
                              fill="currentColor"
                              strokeWidth={0}
                            />
                            WhatsApp
                          </a>
                        )}
                        {o.status !== "delivered" && o.status !== "cancelled" && (
                          <button
                            onClick={() => advanceStatus(o)}
                            disabled={updating === o.id}
                            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold hover:border-primary disabled:opacity-60"
                          >
                            Avançar status
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
