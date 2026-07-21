import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Eye, ShoppingBag, Tags, ArrowUpRight, Plus, Clock } from "lucide-react";
import { formatBRL } from "@/lib/types";
import { productImageUrl } from "@/lib/storage";
import { getCategories } from "@/lib/queries";
import { getAdminProducts, getOrders } from "@/lib/admin-queries";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [products, categories, orders] = await Promise.all([
      getAdminProducts(),
      getCategories(),
      getOrders(),
    ]);
    return { products, categories, orders };
  },
  component: DashboardPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending_whatsapp: "Novo",
  confirmed: "Em atendimento",
  processing: "Em atendimento",
  shipped: "Em atendimento",
  delivered: "Concluído",
  cancelled: "Cancelado",
};

function DashboardPage() {
  const { products, categories, orders } = Route.useLoaderData();
  const topViewed = [...products].sort((a, b) => b.view_count - a.view_count).slice(0, 5);
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);
  const recentOrders = orders.slice(0, 4);
  const today = new Date().toDateString();
  const ordersToday = orders.filter((o) => new Date(o.created_at).toDateString() === today).length;

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
        <MetricCard icon={Package} label="Total de produtos" value={products.length.toString()} />
        <MetricCard icon={ShoppingBag} label="Pedidos hoje" value={ordersToday.toString()} />
        <MetricCard icon={Tags} label="Categorias" value={categories.length.toString()} />
        <MetricCard
          icon={Eye}
          label="Mais visualizado"
          value={topViewed[0]?.view_count.toLocaleString("pt-BR") ?? "—"}
          trend={topViewed[0]?.name.split(" ").slice(0, 3).join(" ")}
        />
      </div>

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
          {recentOrders.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Nenhum pedido recebido ainda.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 p-4 hover:bg-accent/30"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{o.order_number}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {o.customer?.name ?? o.guest_name ?? "Cliente"} • {o.items.length}{" "}
                      {o.items.length === 1 ? "item" : "itens"}
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
          )}
        </section>

        {/* Top viewed */}
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-display text-xl font-bold">Mais visualizados</h2>
              <p className="text-xs text-muted-foreground">Produtos com maior interesse</p>
            </div>
            <Eye className="h-5 w-5 text-primary" />
          </div>
          {topViewed.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
          ) : (
            <ol className="divide-y divide-border">
              {topViewed.map((p, i) => {
                const img = p.images.find((im) => im.is_primary) ?? p.images[0];
                return (
                  <li key={p.id} className="flex items-center gap-3 p-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/15 font-display text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    {img ? (
                      <img
                        src={productImageUrl(img.storage_path)}
                        alt={p.name}
                        className="h-11 w-11 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-11 w-11 shrink-0 rounded-md bg-gradient-metal" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.view_count.toLocaleString("pt-BR")} visualizações
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </li>
                );
              })}
            </ol>
          )}
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
        {recentProducts.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentProducts.map((p) => {
              const img = p.images.find((im) => im.is_primary) ?? p.images[0];
              return (
                <div key={p.id} className="rounded-md border border-border bg-background p-3">
                  {img ? (
                    <img
                      src={productImageUrl(img.storage_path)}
                      alt={p.name}
                      className="aspect-video w-full rounded object-cover"
                    />
                  ) : (
                    <div className="aspect-video rounded bg-gradient-metal" />
                  )}
                  <div className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold">{p.name}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-bold text-primary">{formatBRL(p.price)}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> novo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
      {trend && (
        <div className="mt-1 truncate text-xs font-medium text-muted-foreground">{trend}</div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_whatsapp: "bg-primary/20 text-primary",
    confirmed: "bg-yellow-500/20 text-yellow-400",
    processing: "bg-yellow-500/20 text-yellow-400",
    shipped: "bg-yellow-500/20 text-yellow-400",
    delivered: "bg-green-500/20 text-green-400",
    cancelled: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status] ?? "bg-muted"}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
