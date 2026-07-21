import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag, Package } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/types";
import { productImageUrl } from "@/lib/storage";
import { getStoreSettings } from "@/lib/queries";
import { createGuestOrder } from "@/lib/checkout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/carrinho")({
  loader: async () => ({ storeSettings: await getStoreSettings() }),
  component: CartPage,
});

function buildWhatsappMessage(
  orderNumber: string,
  items: { name: string; code: string; quantity: number; price: number }[],
  notes: string,
  total: number,
) {
  const lines: string[] = [];
  lines.push("🛒 *NOVO PEDIDO — ZANKAR AUTO PARTS*");
  lines.push(`Pedido: *${orderNumber}*`);
  lines.push("");
  items.forEach((i, idx) => {
    lines.push(`${idx + 1}. ${i.name}`);
    lines.push(`   Cód: ${i.code} • ${i.quantity}x • ${formatBRL(i.price * i.quantity)}`);
  });
  lines.push("");
  lines.push(`*Total: ${formatBRL(total)}*`);
  if (notes.trim()) {
    lines.push("");
    lines.push(`📝 Observações: ${notes.trim()}`);
  }
  return lines.join("\n");
}

function CartPage() {
  const { storeSettings } = Route.useLoaderData();
  const { items, setQty, remove, notes, setNotes, total, clear } = useCart();
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const whatsapp = storeSettings?.phone_whatsapp ?? "5511999999999";

  const canSubmit = items.length > 0 && guestName.trim() && guestPhone.trim() && !submitting;

  const handleCheckout = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const order = await createGuestOrder({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        guestName,
        guestPhone,
        notes,
      });
      const message = buildWhatsappMessage(
        order.order_number,
        items.map((i) => ({
          name: i.product.name,
          code: i.product.sku,
          quantity: i.quantity,
          price: i.product.price,
        })),
        notes,
        order.total,
      );
      window.open(
        `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noreferrer",
      );
      clear();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível confirmar o pedido. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Meu pedido</h1>
        <p className="mt-1 text-muted-foreground">
          Revise os itens e envie diretamente pelo WhatsApp para finalizar.
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <p className="mt-4 font-display text-2xl font-bold">Carrinho vazio</p>
            <p className="mt-1 text-muted-foreground">
              Adicione peças do catálogo para começar seu pedido.
            </p>
            <Button asChild size="lg" className="mt-6 h-12 bg-gradient-red">
              <Link to="/catalogo">Explorar catálogo</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Items list */}
            <div className="space-y-4">
              {items.map(({ product, quantity }) => {
                const image = product.images[0];
                return (
                  <div
                    key={product.id}
                    className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[100px_1fr_auto]"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-md bg-gradient-to-br from-[#2a1f35] via-[#1f1f1f] to-[#0f0f12] sm:w-[100px]">
                      {image ? (
                        <img
                          src={productImageUrl(image.storage_path)}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center">
                          <Package className="h-10 w-10 text-white/25" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to="/produto/$id"
                        params={{ id: product.slug }}
                        className="line-clamp-2 text-lg font-bold leading-tight hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Cód. {product.sku} {product.brand ? `• ${product.brand.name}` : ""}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="flex h-11 items-center rounded-md border-2 border-border bg-background">
                          <button
                            onClick={() => setQty(product.id, quantity - 1)}
                            className="grid h-full w-10 place-items-center hover:bg-accent"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-bold">{quantity}</span>
                          <button
                            onClick={() => setQty(product.id, quantity + 1)}
                            className="grid h-full w-10 place-items-center hover:bg-accent"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(product.id)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" /> Remover
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase text-muted-foreground">Subtotal</div>
                      <div className="font-display text-2xl font-bold text-primary">
                        {formatBRL(product.price * quantity)}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="guest-name"
                    className="text-sm font-bold uppercase tracking-wider"
                  >
                    Seu nome
                  </Label>
                  <Input
                    id="guest-name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Como podemos te chamar"
                    className="mt-2 h-11"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="guest-phone"
                    className="text-sm font-bold uppercase tracking-wider"
                  >
                    Seu WhatsApp
                  </Label>
                  <Input
                    id="guest-phone"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="(11) 90000-0000"
                    className="mt-2 h-11"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <label htmlFor="notes" className="text-sm font-bold uppercase tracking-wider">
                  Observações do pedido
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: preciso urgente, prefiro peça original, veículo é ano 2015..."
                  className="mt-2 min-h-24 text-base"
                />
              </div>
            </div>

            {/* Summary */}
            <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-display text-xl font-bold">Resumo</h3>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Itens</dt>
                    <dd className="font-semibold">{items.reduce((s, i) => s + i.quantity, 0)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-semibold">{formatBRL(total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Frete</dt>
                    <dd className="font-semibold">A combinar</dd>
                  </div>
                </dl>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm uppercase text-muted-foreground">Total</span>
                    <span className="font-display text-3xl font-bold text-primary">
                      {formatBRL(total)}
                    </span>
                  </div>
                </div>
                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                <Button
                  size="lg"
                  className="mt-5 h-14 w-full bg-whatsapp text-lg font-bold text-white hover:bg-whatsapp/90"
                  onClick={handleCheckout}
                  disabled={!canSubmit}
                >
                  <MessageCircle className="mr-2 h-6 w-6" />
                  {submitting ? "Confirmando pedido..." : "Enviar pedido pelo WhatsApp"}
                </Button>
                {items.length > 0 && (!guestName.trim() || !guestPhone.trim()) && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Preencha nome e WhatsApp para confirmar o pedido.
                  </p>
                )}
                <button
                  onClick={clear}
                  className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-destructive"
                >
                  Esvaziar carrinho
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
