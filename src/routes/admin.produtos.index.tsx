import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/types";
import { productImageUrl } from "@/lib/storage";
import { getCategories } from "@/lib/queries";
import { deleteProduct, getAdminProducts, type AdminProduct } from "@/lib/admin-queries";

export const Route = createFileRoute("/admin/produtos/")({
  loader: async () => {
    const [products, categories] = await Promise.all([getAdminProducts(), getCategories()]);
    return { products, categories };
  },
  component: AdminProductsPage,
});

const stockFilters = ["Todos", "Em estoque", "Baixo", "Esgotado"] as const;

function AdminProductsPage() {
  const router = useRouter();
  const { products, categories } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("todas");
  const [stockFilter, setStockFilter] = useState<(typeof stockFilters)[number]>("Todos");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchQ =
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.sku.toLowerCase().includes(q.toLowerCase());
    const matchCat = cat === "todas" || p.category?.slug === cat;
    const matchStock =
      stockFilter === "Todos" ||
      (stockFilter === "Esgotado" && p.stock_quantity === 0) ||
      (stockFilter === "Baixo" && p.stock_quantity > 0 && p.stock_quantity < 6) ||
      (stockFilter === "Em estoque" && p.stock_quantity >= 6);
    return matchQ && matchCat && matchStock;
  });

  async function handleDelete(p: AdminProduct) {
    if (!confirm(`Excluir "${p.name}"? Essa ação não pode ser desfeita.`)) return;
    setDeletingId(p.id);
    try {
      await deleteProduct({ data: p.id });
      router.invalidate();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie o catálogo da loja</p>
        </div>
        <Button asChild size="lg" className="h-12 bg-gradient-red font-bold shrink-0">
          <Link to="/admin/produtos/novo">
            <Plus className="mr-2 h-5 w-5" /> Novo produto
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {/* Toolbar */}
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center rounded-md border border-border bg-input">
              <Search className="ml-3 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome ou código..."
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {filtered.length} {filtered.length === 1 ? "item" : "itens"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Categoria:
            </span>
            <button
              onClick={() => setCat("todas")}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                cat === "todas"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setCat(c.slug)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                  cat === c.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Estoque:
            </span>
            {stockFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStockFilter(s)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                  stockFilter === s
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
            {products.length === 0
              ? "Nenhum produto cadastrado ainda. Clique em “Novo produto” para começar."
              : "Nenhum produto encontrado com esse filtro."}
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-sidebar/50">
                  <tr className="text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="w-16 px-4 py-3">Foto</th>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Preço</th>
                    <th className="px-4 py-3">Estoque</th>
                    <th className="w-32 px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-accent/30">
                      <td className="px-4 py-3">
                        <ProductThumb product={p} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.marca_veiculo?.nome ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-secondary px-2 py-1 text-xs">
                          {p.category?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{formatBRL(p.price)}</td>
                      <td className="px-4 py-3">
                        <StockBadge stock={p.stock_quantity} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            to="/admin/produtos/$id"
                            params={{ id: p.id }}
                            className="grid h-9 w-9 place-items-center rounded-md border border-border hover:border-primary hover:text-primary"
                            aria-label="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p.id}
                            className="grid h-9 w-9 place-items-center rounded-md border border-border hover:border-destructive hover:text-destructive disabled:opacity-50"
                            aria-label="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border md:hidden">
              {filtered.map((p) => (
                <div key={p.id} className="grid grid-cols-[64px_1fr_auto] gap-3 p-4">
                  <ProductThumb product={p} size="lg" />
                  <div className="min-w-0">
                    <div className="line-clamp-1 font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.sku} • {p.category?.name ?? "—"}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{formatBRL(p.price)}</span>
                      <StockBadge stock={p.stock_quantity} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/admin/produtos/$id"
                      params={{ id: p.id }}
                      className="grid h-9 w-9 place-items-center rounded-md border border-border"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                      className="grid h-9 w-9 place-items-center rounded-md border border-border text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductThumb({ product, size = "sm" }: { product: AdminProduct; size?: "sm" | "lg" }) {
  const primary = product.images.find((i) => i.is_primary) ?? product.images[0];
  const dims = size === "sm" ? "h-12 w-12" : "h-16 w-16";
  if (primary) {
    return (
      <img
        src={productImageUrl(primary.storage_path)}
        alt={product.name}
        className={`${dims} rounded-md object-cover`}
      />
    );
  }
  return (
    <div className={`grid ${dims} place-items-center rounded-md bg-gradient-metal`}>
      <Package className="h-5 w-5 text-metal-foreground/60" strokeWidth={1.5} />
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="rounded bg-destructive/20 px-2 py-0.5 text-xs font-bold text-destructive">
        Esgotado
      </span>
    );
  if (stock < 6)
    return (
      <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-bold text-yellow-400">
        {stock} unid.
      </span>
    );
  return (
    <span className="rounded bg-green-500/15 px-2 py-0.5 text-xs font-bold text-green-400">
      {stock} unid.
    </span>
  );
}
