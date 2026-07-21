import { Link } from "@tanstack/react-router";
import { ShoppingCart, Package, Barcode } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatBRL } from "@/lib/types";
import { productImageUrl } from "@/lib/storage";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];
  const compat = product.compatibility[0];

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition hover:border-primary/60">
      <Link
        to="/produto/$id"
        params={{ id: product.slug }}
        className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-[#2a1f35] via-[#1f1f1f] to-[#0f0f12] diagonal-stripes"
      >
        {primaryImage ? (
          <img
            src={productImageUrl(primaryImage.storage_path)}
            alt={primaryImage.alt_text ?? product.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Package className="h-24 w-24 text-white/20" strokeWidth={1} />
          </div>
        )}
        {product.marca_veiculo && (
          <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            {product.marca_veiculo.nome}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          to="/produto/$id"
          params={{ id: product.slug }}
          className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-snug hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Barcode className="h-3.5 w-3.5" /> Cód. {product.sku}
        </div>
        {compat && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {compat.modelo_nome} {compat.versao_nome} ({compat.ano_inicio}–
            {compat.ano_fim ?? "atual"})
          </p>
        )}
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              à vista
            </div>
            <div className="font-display text-2xl font-bold text-primary">
              {formatBRL(product.price)}
            </div>
          </div>
        </div>
        <Button
          size="lg"
          className="w-full bg-gradient-red text-base font-bold hover:brightness-110"
          onClick={() => add(product)}
          disabled={product.stock_quantity <= 0}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {product.stock_quantity > 0 ? "Adicionar" : "Sem estoque"}
        </Button>
      </div>
    </div>
  );
}
