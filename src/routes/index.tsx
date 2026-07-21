import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Truck, MessageCircle, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { getCategories, getFeaturedProducts, getStoreSettings } from "@/lib/queries";
import { categoryIcon } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [categories, featured, storeSettings] = await Promise.all([
      getCategories(),
      getFeaturedProducts(),
      getStoreSettings(),
    ]);
    return { categories, featured, storeSettings };
  },
  component: HomePage,
});

function HomePage() {
  const { categories, featured, storeSettings } = Route.useLoaderData();
  const whatsapp = storeSettings?.phone_whatsapp ?? "5511999999999";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 diagonal-stripes opacity-60" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              <Star className="h-3 w-3 fill-primary" /> Loja com 25 anos de tradição
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[0.95] text-shadow-hero md:text-6xl lg:text-7xl">
              Encontre a peça <br />
              <span className="text-primary">certa</span> para o<br />
              seu veículo.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground md:text-xl">
              Faróis, lanternas, parachoques, lataria e acessórios com o melhor preço. Atendimento
              direto com o funileiro pelo WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-14 bg-gradient-red text-lg font-bold hover:brightness-110"
              >
                <Link to="/catalogo">
                  Ver Catálogo Completo <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 border-2 bg-whatsapp/10 text-lg font-bold text-white hover:bg-whatsapp"
              >
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" /> Falar com Vendedor
                </a>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Feature icon={ShieldCheck} label="Garantia" value="Peças originais" />
              <Feature icon={Truck} label="Entrega" value="Rápida na região" />
              <Feature icon={MessageCircle} label="Suporte" value="Direto pelo WhatsApp" />
            </div>
          </div>

          {/* Hero visual card */}
          {featured[0] && (
            <div className="relative hidden md:block">
              <div className="absolute -right-8 top-8 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
              <div className="relative aspect-square rounded-2xl border border-border bg-gradient-to-br from-[#4b1e78] via-[#341463] to-[#1f1f1f] p-8 shadow-red">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-primary">
                      Destaque da semana
                    </div>
                    <div className="mt-2 font-display text-3xl font-bold">{featured[0].name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {featured[0].category?.name}
                    </div>
                  </div>
                  <div className="rounded-lg bg-black/40 p-4 backdrop-blur">
                    <div className="text-xs uppercase text-muted-foreground">A partir de</div>
                    <div className="font-display text-4xl font-bold text-primary">
                      {featured[0].price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <SectionTitle title="Categorias" subtitle="Escolha o que você procura" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {categories.map((c) => {
            const Icon = categoryIcon(c.icon);
            return (
              <Link
                key={c.slug}
                to="/catalogo"
                search={{ cat: c.slug } as never}
                className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-5 text-center transition hover:-translate-y-1 hover:border-primary hover:shadow-red"
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-metal shadow-inner">
                  <Icon className="h-8 w-8 text-metal-foreground" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-base font-bold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.product_count} itens</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-end justify-between">
          <SectionTitle title="Produtos em destaque" subtitle="Os mais buscados pelos funileiros" />
          <Link
            to="/catalogo"
            className="hidden text-sm font-semibold text-primary hover:underline md:inline"
          >
            Ver todos →
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">
            Nenhum produto em destaque cadastrado ainda.
          </p>
        )}
        <div className="mt-8 text-center md:hidden">
          <Button asChild size="lg" variant="outline" className="h-12">
            <Link to="/catalogo">Ver todo o catálogo</Link>
          </Button>
        </div>
      </section>

      {/* Brand strip */}
      <section className="mt-8 border-y border-border bg-card/60 diagonal-stripes">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-6 py-8 text-muted-foreground md:gap-12">
          {["Arteb", "Fitam", "Metagal", "TG Poli", "IMP", "JR8"].map((b) => (
            <span key={b} className="font-display text-xl font-bold tracking-widest opacity-70">
              {b.toUpperCase()}
            </span>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Feature({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-black/30 p-3 backdrop-blur">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/20 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-widest text-primary">{subtitle}</div>
      <h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">{title}</h2>
    </div>
  );
}
