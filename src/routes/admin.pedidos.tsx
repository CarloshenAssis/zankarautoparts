import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Search, Filter } from "lucide-react";
import { formatBRL, products } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/admin/pedidos")({
  component: PedidosPage,
});

type Order = {
  id: string;
  customer: string;
  phone: string;
  date: string;
  items: { name: string; qty: number; price: number }[];
  status: "Novo" | "Em atendimento" | "Concluído" | "Cancelado";
};

const orders: Order[] = [
  {
    id: "#1042",
    customer: "Ricardo Menezes",
    phone: "(11) 98123-4501",
    date: "Hoje, 14:32",
    status: "Novo",
    items: [
      { name: products[0].name, qty: 1, price: products[0].price },
      { name: products[2].name, qty: 2, price: products[2].price },
    ],
  },
  {
    id: "#1041",
    customer: "Auto Center Silva",
    phone: "(11) 4022-8891",
    date: "Hoje, 13:58",
    status: "Em atendimento",
    items: [
      { name: products[3].name, qty: 1, price: products[3].price },
      { name: products[5].name, qty: 4, price: products[5].price },
      { name: products[6].name, qty: 2, price: products[6].price },
    ],
  },
  {
    id: "#1040",
    customer: "Marcos Ferreira",
    phone: "(21) 99988-4110",
    date: "Hoje, 12:04",
    status: "Novo",
    items: [{ name: products[0].name, qty: 1, price: products[0].price }],
  },
  {
    id: "#1039",
    customer: "Funilaria Santos",
    phone: "(31) 3555-2200",
    date: "Ontem, 17:20",
    status: "Concluído",
    items: [
      { name: products[4].name, qty: 3, price: products[4].price },
      { name: products[7].name, qty: 2, price: products[7].price },
    ],
  },
  {
    id: "#1038",
    customer: "Célia Batista",
    phone: "(11) 97710-3388",
    date: "Ontem, 10:12",
    status: "Concluído",
    items: [{ name: products[1].name, qty: 2, price: products[1].price }],
  },
  {
    id: "#1037",
    customer: "Oficina Rodas & Cia",
    phone: "(19) 3421-9080",
    date: "2 dias atrás",
    status: "Cancelado",
    items: [{ name: products[3].name, qty: 1, price: products[3].price }],
  },
];

const statusFilters = ["Todos", "Novo", "Em atendimento", "Concluído", "Cancelado"] as const;

function PedidosPage() {
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("Todos");
  const filtered = filter === "Todos" ? orders : orders.filter((o) => o.status === filter);

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

        <div className="divide-y divide-border">
          {filtered.map((o) => {
            const total = o.items.reduce((sum, i) => sum + i.price * i.qty, 0);
            return (
              <div key={o.id} className="p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-bold">{o.id}</span>
                      <StatusBadge status={o.status} />
                      <span className="text-xs text-muted-foreground">• {o.date}</span>
                    </div>
                    <div className="mt-1">
                      <div className="text-lg font-semibold">{o.customer}</div>
                      <div className="text-sm text-muted-foreground">{o.phone}</div>
                    </div>

                    <ul className="mt-3 space-y-1 border-l-2 border-primary/40 pl-3 text-sm">
                      {o.items.map((it, i) => (
                        <li key={i} className="flex items-center justify-between gap-4">
                          <span className="truncate">
                            <span className="font-semibold text-primary">{it.qty}x</span> {it.name}
                          </span>
                          <span className="shrink-0 text-muted-foreground">
                            {formatBRL(it.price * it.qty)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        Valor estimado
                      </div>
                      <div className="font-display text-2xl font-bold text-primary">
                        {formatBRL(total)}
                      </div>
                    </div>
                    <button className="inline-flex h-11 items-center gap-2 rounded-md bg-[#25D366] px-4 font-bold text-white transition hover:brightness-110">
                      <MessageCircle className="h-5 w-5" fill="currentColor" strokeWidth={0} />
                      Responder no WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    Novo: "bg-primary/20 text-primary",
    "Em atendimento": "bg-yellow-500/20 text-yellow-400",
    Concluído: "bg-green-500/20 text-green-400",
    Cancelado: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status]}`}
    >
      {status}
    </span>
  );
}
