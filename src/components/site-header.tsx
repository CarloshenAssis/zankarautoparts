import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, MessageCircle, Menu } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";

export function SiteHeader() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/catalogo", search: { q } as never });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6 md:px-6 md:py-4">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <BrandMark hideTextOnMobile />
        </Link>

        {/* Search */}
        <form onSubmit={submit} className="flex min-w-0 flex-1">
          <div className="flex w-full items-center overflow-hidden rounded-md border-2 border-border bg-input focus-within:border-primary">
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar peça, código ou veículo..."
              className="w-full bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted-foreground md:text-lg"
            />
            <button
              type="submit"
              className="hidden bg-gradient-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:brightness-110 md:block"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noreferrer"
            className="hidden h-12 w-12 place-items-center rounded-md bg-whatsapp text-white transition hover:brightness-110 md:grid"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
          </a>
          <Link
            to="/carrinho"
            className="relative grid h-12 w-12 place-items-center rounded-md border-2 border-border bg-card transition hover:border-primary"
            aria-label="Carrinho"
          >
            <ShoppingCart className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-12 w-12 place-items-center rounded-md border-2 border-border md:hidden"
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="hidden border-t border-border bg-card/40 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2 text-sm font-medium">
          <Link to="/" className="text-foreground/80 hover:text-primary">
            Início
          </Link>
          <Link to="/catalogo" className="text-foreground/80 hover:text-primary">
            Catálogo
          </Link>
          <Link to="/catalogo" className="text-foreground/80 hover:text-primary">
            Marcas
          </Link>
          <Link to="/carrinho" className="text-foreground/80 hover:text-primary">
            Meu Pedido
          </Link>
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span>Atendimento: Seg-Sáb 8h às 18h</span>
            <Link to="/login" className="font-semibold text-foreground/80 hover:text-primary">
              Área do Lojista →
            </Link>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1 text-base">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="rounded px-3 py-3 hover:bg-accent"
            >
              Início
            </Link>
            <Link
              to="/catalogo"
              onClick={() => setMenuOpen(false)}
              className="rounded px-3 py-3 hover:bg-accent"
            >
              Catálogo
            </Link>
            <Link
              to="/carrinho"
              onClick={() => setMenuOpen(false)}
              className="rounded px-3 py-3 hover:bg-accent"
            >
              Meu Pedido
            </Link>
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="rounded px-3 py-3 hover:bg-accent"
            >
              Painel Admin
            </Link>
            <Button asChild size="lg" className="mt-2 bg-whatsapp text-white hover:bg-whatsapp/90">
              <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" /> Falar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
