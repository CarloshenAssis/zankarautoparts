import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  Eye,
  ShoppingBag,
  Tags,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Clock,
} from "lucide-react";
import { products, categories, formatBRL } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

const mockOrders = [
  { id: "#1042", customer: "Ricardo M.", items: 3, total: 1189, status: "Novo", date: "há 5 min" },
  {
    id: "#1041",
    customer: "Auto Center Silva",
    items: 7,
    total: 2380,
    status: "Em atendimento",
    date: "há 32 min",
  },
  { id: "#1040", customer: "Marcos F.", items: 1, total: 489.9, status: "Novo", date: "há 1h" },
  {
    id: "#1039",
    customer: "Funilaria Santos",
    items: 12,
    total: 4290,
    status: "Concluído",
    date: "há 2h",
  },
];

// Gráfico ilustrativo (mock)
const chart = [
  { day: "Seg", value: 42 },
  { day: "Ter", value: 58 },
  { day: "Qua", value: 51 },
  { day: "Qui", value: 79 },
  { day: "Sex", value: 96 },
  { day: "Sáb", value: 84 },
  { day: "Dom", value: 38 },
];

function DashboardPage() {
  const topViewed = [...products].sort((a, b) => b.views - a.views).slice(0, 5);
  const recentProducts = products.slice(0, 4);
  const maxChart = Math.max(...chart.map((c) => c.value));

  return (
    <div>
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Visão geral da sua loja</p>
        </div>
        <Button asChild size="lg" className="h-12 bg-gradient-red font-bold shrink-0">
          <Link to="/admin/produtos/novo">
            <Plus className="mr-2 h-5 w-5" /> Adicionar produto
          </Link>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Package}
          label="Total de produtos"
          value={products.length.toString()}
          trend="+3 este mês"
        />
        <MetricCard icon={ShoppingBag} label="Pedidos hoje" value="8" trend="+2 vs ontem" />
        <MetricCard icon={Tags} label="Categorias" value={categories.length.toString()} />
        <MetricCard
          icon={Eye}
          label="Mais visualizado"
          value={topViewed[0].views.toLocaleString("pt-BR")}
          trend={topViewed[0].name.split(" ").slice(0, 3).join(" ")}
        />
      </div>

      {/* Chart */}
      <section className="mt-8 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Acessos ao catálogo</h2>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="font-bold text-success">+22%</span>
            <span className="text-muted-foreground">vs semana anterior</span>
          </div>
        </div>
        <div className="mt-6 flex h-48 items-end gap-3">
          {chart.map((c) => (
            <div key={c.day} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/40 transition hover:from-primary hover:to-primary"
                  style={{ height: `${(c.value / maxChart) * 100}%` }}
                >
                  <div className="pt-1 text-center text-[10px] font-bold text-primary-foreground/90">
                    {c.value}
                  </div>
                </div>
              </div>
              <div className="text-xs font-semibold text-muted-foreground">{c.day}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent orders */}
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-display text-xl font-bold">Pedidos recentes</h2>
              <p className="text-xs text-muted-foreground">
                Últimos pedidos recebidos pelo WhatsApp
              </p>
            </div>
            <Link
              to="/admin/pedidos"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-border">
            {mockOrders.map((o) => (
              <div
                key={o.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 p-4 hover:bg-accent/30"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{o.id}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {o.customer} • {o.items} {o.items === 1 ? "item" : "itens"} • {o.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-bold text-primary">
                    {formatBRL(o.total)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top viewed */}
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-display text-xl font-bold">Mais visualizados</h2>
              <p className="text-xs text-muted-foreground">Produtos com maior interesse</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <ol className="divide-y divide-border">
            {topViewed.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/15 font-display text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div className={`h-11 w-11 shrink-0 rounded-md bg-gradient-to-br ${p.images[0]}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.views.toLocaleString("pt-BR")} visualizações
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Recent products */}
      <section className="mt-8 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="font-display text-xl font-bold">Produtos adicionados recentemente</h2>
            <p className="text-xs text-muted-foreground">Últimas peças cadastradas no catálogo</p>
          </div>
          <Link to="/admin/produtos" className="text-xs font-semibold text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {recentProducts.map((p) => (
            <div key={p.id} className="rounded-md border border-border bg-background p-3">
              <div className={`aspect-video rounded bg-gradient-to-br ${p.images[0]}`} />
              <div className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold">{p.name}</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-bold text-primary">{formatBRL(p.price)}</span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> novo
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 truncate font-display text-3xl font-bold md:text-4xl">{value}</div>
      {trend && <div className="mt-1 truncate text-xs font-medium text-success">{trend}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Novo: "bg-primary/20 text-primary",
    "Em atendimento": "bg-yellow-500/20 text-yellow-400",
    Concluído: "bg-green-500/20 text-green-400",
  };
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status] ?? "bg-muted"}`}
    >
      {status}
    </span>
  );
}
