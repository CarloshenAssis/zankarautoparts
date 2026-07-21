import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, ShoppingBag } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentCustomer } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/conta")({
  beforeLoad: async () => {
    const customer = await getCurrentCustomer();
    if (!customer) throw redirect({ to: "/conta/entrar" });
    return { customer };
  },
  component: ContaPage,
  head: () => ({
    meta: [{ title: "Minha conta | ZANKAR Auto Parts" }],
  }),
});

function ContaPage() {
  const { customer } = Route.useRouteContext();
  const navigate = useNavigate();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Olá, {customer.name}</h1>
        <p className="mt-2 text-muted-foreground">{customer.email}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/catalogo"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-5 transition hover:border-primary"
          >
            <ShoppingBag className="h-6 w-6 text-primary" />
            <div>
              <div className="font-semibold">Ver catálogo</div>
              <div className="text-sm text-muted-foreground">Continue comprando</div>
            </div>
          </Link>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="h-auto justify-start gap-3 p-5 text-left"
          >
            <LogOut className="h-6 w-6" />
            <div>
              <div className="font-semibold">Sair</div>
              <div className="text-sm text-muted-foreground">Encerrar sessão</div>
            </div>
          </Button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
