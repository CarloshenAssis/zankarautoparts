import { createFileRoute } from "@tanstack/react-router";
import { Search, MessageCircle, Phone } from "lucide-react";
import { formatBRL } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/admin/clientes")({
  component: ClientesPage,
});

type Client = {
  id: string;
  name: string;
  phone: string;
  city: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  type: "Pessoa física" | "Empresa";
};

const clients: Client[] = [
  {
    id: "1",
    name: "Ricardo Menezes",
    phone: "(11) 98123-4501",
    city: "São Paulo, SP",
    orders: 4,
    totalSpent: 2890,
    lastOrder: "Hoje",
    type: "Pessoa física",
  },
  {
    id: "2",
    name: "Auto Center Silva",
    phone: "(11) 4022-8891",
    city: "Guarulhos, SP",
    orders: 18,
    totalSpent: 24580,
    lastOrder: "Hoje",
    type: "Empresa",
  },
  {
    id: "3",
    name: "Marcos Ferreira",
    phone: "(21) 99988-4110",
    city: "Rio de Janeiro, RJ",
    orders: 2,
    totalSpent: 719,
    lastOrder: "Hoje",
    type: "Pessoa física",
  },
  {
    id: "4",
    name: "Funilaria Santos",
    phone: "(31) 3555-2200",
    city: "Belo Horizonte, MG",
    orders: 27,
    totalSpent: 41200,
    lastOrder: "Ontem",
    type: "Empresa",
  },
  {
    id: "5",
    name: "Célia Batista",
    phone: "(11) 97710-3388",
    city: "Campinas, SP",
    orders: 3,
    totalSpent: 1240,
    lastOrder: "Ontem",
    type: "Pessoa física",
  },
  {
    id: "6",
    name: "Oficina Rodas & Cia",
    phone: "(19) 3421-9080",
    city: "Piracicaba, SP",
    orders: 9,
    totalSpent: 8790,
    lastOrder: "3 dias",
    type: "Empresa",
  },
];

function ClientesPage() {
  const [q, setQ] = useState("");
  const filtered = clients.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todos os clientes que fizeram pedidos pelo catálogo
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center rounded-md border border-border bg-input">
            <Search className="ml-3 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-sidebar/50">
              <tr className="text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Cidade</th>
                <th className="px-4 py-3 text-center">Pedidos</th>
                <th className="px-4 py-3">Total gasto</th>
                <th className="px-4 py-3">Último pedido</th>
                <th className="w-16 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.city}</td>
                  <td className="px-4 py-3 text-center font-bold">{c.orders}</td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    {formatBRL(c.totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.lastOrder}</td>
                  <td className="px-4 py-3">
                    <button
                      className="grid h-9 w-9 place-items-center rounded-md bg-[#25D366] text-white hover:brightness-110"
                      aria-label="Enviar mensagem"
                    >
                      <MessageCircle className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="divide-y divide-border md:hidden">
          {filtered.map((c) => (
            <div key={c.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {c.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.city}</div>
                </div>
                <button className="grid h-10 w-10 place-items-center rounded-md bg-[#25D366] text-white">
                  <MessageCircle className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded bg-secondary p-2">
                  <div className="font-bold">{c.orders}</div>
                  <div className="text-muted-foreground">Pedidos</div>
                </div>
                <div className="rounded bg-secondary p-2">
                  <div className="font-bold text-primary">{formatBRL(c.totalSpent)}</div>
                  <div className="text-muted-foreground">Total</div>
                </div>
                <div className="rounded bg-secondary p-2">
                  <div className="font-bold">{c.lastOrder}</div>
                  <div className="text-muted-foreground">Último</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" /> {c.phone}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
