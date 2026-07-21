import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingCart,
  MessageCircle,
  Barcode,
  ShieldCheck,
  Truck,
  Package,
  ArrowLeft,
  Minus,
  Plus,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Product, StoreSettings } from "@/lib/types";
import { formatBRL } from "@/lib/types";
import { productImageUrl } from "@/lib/storage";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

export function vehicleSlugFor(compat: { marca_slug: string; modelo_slug: string }): string {
  return `${compat.marca_slug}-${compat.modelo_slug}`;
}

const SITE_URL = "https://zankar.com.br";

function buildProductJsonLd(product: Product) {
  const image = product.images.map((img) => productImageUrl(img.storage_path));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description:
      product.description_short || product.description || `${product.name} — Cód. ${product.sku}`,
    ...(image.length ? { image } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand.name } } : {}),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/produto/${product.slug}`,
      priceCurrency: "BRL",
      price: product.price,
      availability:
        product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.compatibility.length
      ? {
          additionalProperty: product.compatibility.map((c) => ({
            "@type": "PropertyValue",
            name: "Compatível com",
            value: `${c.marca_nome} ${c.modelo_nome} ${c.versao_nome} (${
              c.ano_especifico ?? `${c.ano_inicio}–${c.ano_fim ?? "atual"}`
            })`,
          })),
        }
      : {}),
  };
}

export function buildProductHead(product: Product, modeloSlug?: string) {
  const displayVehicle =
    modeloSlug && product.compatibility[0]
      ? `${product.compatibility[0].marca_nome} ${product.compatibility[0].modelo_nome}`
      : null;
  const title = displayVehicle
    ? `${product.name} ${displayVehicle} | ZANKAR Auto Parts`
    : `${product.name} | ZANKAR Auto Parts`;
  const baseDescription =
    product.description_short ||
    product.description ||
    `${product.name} — Cód. ${product.sku}. Confira preço e disponibilidade na ZANKAR Auto Parts.`;
  const description = displayVehicle
    ? `${baseDescription} Compatível com ${displayVehicle}.`
    : baseDescription;
  const image = product.images[0] ? productImageUrl(product.images[0].storage_path) : undefined;
  const canonicalUrl = `/produto/${product.slug}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "product" },
      ...(image ? [{ property: "og:image", content: image }] : []),
      { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { "script:ld+json": buildProductJsonLd(product) },
    ],
    links: modeloSlug ? [{ rel: "canonical", href: canonicalUrl }] : [],
  };
}

export function ProductNotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-bold">Produto não encontrado</h1>
        <Button asChild className="mt-6">
          <Link to="/catalogo">Ver catálogo</Link>
        </Button>
      </div>
    </div>
  );
}

export function ProductDetailPage({
  product,
  related,
  storeSettings,
}: {
  product: Product;
  related: Product[];
  storeSettings: StoreSettings | null;
}) {
  const [selected, setSelected] = useState(0);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const whatsapp = storeSettings?.phone_whatsapp ?? "5511999999999";
  const activeImage = product.images[selected];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-12 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#2a1f35] via-[#1f1f1f] to-[#0f0f12] diagonal-stripes shadow-card">
            {activeImage ? (
              <img
                src={productImageUrl(activeImage.storage_path)}
                alt={activeImage.alt_text ?? product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <Package className="h-40 w-40 text-white/15" strokeWidth={1} />
              </div>
            )}
            {product.marca_veiculo && (
              <span className="absolute left-4 top-4 rounded bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                {product.marca_veiculo.nome}
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelected(i)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                    selected === i ? "border-primary" : "border-border"
                  }`}
                >
                  <img
                    src={productImageUrl(img.storage_path)}
                    alt={img.alt_text ?? product.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <div className="text-xs font-bold uppercase tracking-widest text-primary">
              {product.category.name}
            </div>
          )}
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Barcode className="h-4 w-4" /> Código:{" "}
              <strong className="text-foreground">{product.sku}</strong>
            </span>
            {product.marca_veiculo && (
              <span>
                Marca: <strong className="text-foreground">{product.marca_veiculo.nome}</strong>
              </span>
            )}
            {product.brand && (
              <span className="text-xs">Fabricante da peça: {product.brand.name}</span>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Preço à vista
            </div>
            <div className="font-display text-5xl font-bold text-primary">
              {formatBRL(product.price)}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              ou 3x de {formatBRL(product.price / 3)} sem juros
            </div>
          </div>

          {product.compatibility.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Veículos compatíveis
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.compatibility.map((c) => {
                  const vehicleSlug = vehicleSlugFor(c);
                  const href =
                    product.compatibilityModel === "1"
                      ? `/produto/${product.slug}/${vehicleSlug}`
                      : `/produto/${product.slug}`;
                  return (
                    <a
                      key={c.versao_id}
                      href={href}
                      className="rounded-md border border-border bg-card px-3 py-1.5 text-sm transition hover:bg-accent hover:text-accent-foreground"
                    >
                      {c.marca_nome} {c.modelo_nome} {c.versao_nome} (
                      {c.ano_especifico ?? `${c.ano_inicio}–${c.ano_fim ?? "atual"}`})
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Qty + CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex h-14 items-center rounded-md border-2 border-border bg-card">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-full w-12 place-items-center hover:bg-accent"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="w-12 text-center text-xl font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
                className="grid h-full w-12 place-items-center hover:bg-accent"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <Button
              size="lg"
              className="h-14 flex-1 bg-gradient-red text-lg font-bold hover:brightness-110"
              onClick={() => add(product, qty)}
              disabled={product.stock_quantity <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock_quantity > 0 ? "Adicionar ao carrinho" : "Sem estoque"}
            </Button>
          </div>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="mt-3 h-14 w-full border-2 bg-whatsapp/10 text-lg font-bold text-white hover:bg-whatsapp"
          >
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre ${product.name} (cód. ${product.sku})`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="mr-2 h-5 w-5" /> Falar no WhatsApp
            </a>
          </Button>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-md border border-border bg-card p-3 text-sm">
              <ShieldCheck className="h-5 w-5 text-primary" /> Garantia 12 meses
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-card p-3 text-sm">
              <Truck className="h-5 w-5 text-primary" /> Entrega rápida
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-2xl font-bold">Descrição detalhada</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {product.description || "Sem descrição cadastrada."}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-2xl font-bold">Informações adicionais</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {product.description_short || "—"}
            </p>
            <dl className="mt-4 divide-y divide-border text-sm">
              <div className="flex justify-between py-2">
                <dt className="text-muted-foreground">Código interno</dt>
                <dd className="font-semibold">{product.sku}</dd>
              </div>
              {product.marca_veiculo && (
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">Marca</dt>
                  <dd className="font-semibold">{product.marca_veiculo.nome}</dd>
                </div>
              )}
              {product.brand && (
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">Fabricante da peça</dt>
                  <dd className="font-semibold">{product.brand.name}</dd>
                </div>
              )}
              {product.category && (
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">Categoria</dt>
                  <dd className="font-semibold">{product.category.name}</dd>
                </div>
              )}
              <div className="flex justify-between py-2">
                <dt className="text-muted-foreground">Estoque</dt>
                <dd className="font-semibold text-success">
                  {product.stock_quantity > 0
                    ? `${product.stock_quantity} em estoque`
                    : "Sob consulta"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <h3 className="font-display text-2xl font-bold md:text-3xl">Produtos relacionados</h3>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
