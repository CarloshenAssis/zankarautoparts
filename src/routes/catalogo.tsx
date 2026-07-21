import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { getBrands, getCategories, getProducts } from "@/lib/queries";
import { formatBRL } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

type Search = {
  q?: string;
  cat?: string;
};

export const Route = createFileRoute("/catalogo")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q, cat: search.cat }),
  loader: async ({ deps }) => {
    const [products, categories, brands] = await Promise.all([
      getProducts({ data: { q: deps.q, categorySlug: deps.cat } }),
      getCategories(),
      getBrands(),
    ]);
    return { products, categories, brands };
  },
  component: CatalogoPage,
});

function CatalogoPage() {
  const { q: initialQ, cat: initialCat } = Route.useSearch();
  const { products, categories, brands } = Route.useLoaderData();
  const [q, setQ] = useState(initialQ ?? "");
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCat ? [initialCat] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const maxPrice = Math.max(800, ...products.map((p) => p.price));
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (q && !`${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (selectedCats.length && (!p.category || !selectedCats.includes(p.category.slug)))
        return false;
      if (selectedBrands.length && (!p.brand || !selectedBrands.includes(p.brand.slug)))
        return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
  }, [products, q, selectedCats, selectedBrands, priceRange]);

  const toggle = (arr: string[], setArr: (s: string[]) => void, v: string) => {
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const filtersPanel = (
    <div className="space-y-2">
      <Accordion type="multiple" defaultValue={["cat", "brand", "price"]}>
        <AccordionItem value="cat">
          <AccordionTrigger className="text-base font-bold">Categoria</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {categories.map((c) => (
                <label key={c.slug} className="flex cursor-pointer items-center gap-3 text-sm">
                  <Checkbox
                    checked={selectedCats.includes(c.slug)}
                    onCheckedChange={() => toggle(selectedCats, setSelectedCats, c.slug)}
                    className="h-5 w-5"
                  />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.product_count}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger className="text-base font-bold">Marca</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {brands.map((b) => (
                <label key={b.slug} className="flex cursor-pointer items-center gap-3 text-sm">
                  <Checkbox
                    checked={selectedBrands.includes(b.slug)}
                    onCheckedChange={() => toggle(selectedBrands, setSelectedBrands, b.slug)}
                    className="h-5 w-5"
                  />
                  <span>{b.name}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-bold">Faixa de preço</AccordionTrigger>
          <AccordionContent>
            <div className="px-1 pt-2">
              <Slider
                value={priceRange}
                onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
                min={0}
                max={maxPrice}
                step={10}
              />
              <div className="mt-3 flex justify-between text-sm font-semibold">
                <span>{formatBRL(priceRange[0])}</span>
                <span>{formatBRL(priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Sub bar */}
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-4">
          <div className="flex flex-1 items-center overflow-hidden rounded-md border-2 border-border bg-input">
            <Search className="ml-3 h-5 w-5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar no catálogo..."
              className="w-full bg-transparent px-3 py-3 text-base outline-none"
            />
          </div>
          <Button
            variant="outline"
            size="lg"
            className="h-12 lg:hidden"
            onClick={() => setMobileFilters(true)}
          >
            <SlidersHorizontal className="mr-2 h-5 w-5" /> Filtros
          </Button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-xl font-bold">Filtros</h3>
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3">{filtersPanel}</div>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileFilters && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileFilters(false)} />
            <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-display text-xl font-bold">Filtros</h3>
                <button
                  onClick={() => setMobileFilters(false)}
                  className="grid h-10 w-10 place-items-center rounded-md border border-border"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{filtersPanel}</div>
              <div className="border-t border-border p-4">
                <Button
                  size="lg"
                  className="h-12 w-full bg-gradient-red"
                  onClick={() => setMobileFilters(false)}
                >
                  Ver {filtered.length} produtos
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div>
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">Catálogo</h1>
              <p className="text-sm text-muted-foreground">
                {filtered.length}{" "}
                {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}
              </p>
            </div>
            {(selectedCats.length + selectedBrands.length > 0 || q) && (
              <button
                onClick={() => {
                  setQ("");
                  setSelectedCats([]);
                  setSelectedBrands([]);
                }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/40 p-12 text-center">
              <p className="text-lg font-semibold">Nenhum produto encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {products.length === 0
                  ? "Ainda não há produtos cadastrados no catálogo."
                  : "Tente ajustar os filtros ou buscar por outro termo."}
              </p>
              <Button asChild className="mt-6">
                <Link to="/catalogo">Ver todos os produtos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
