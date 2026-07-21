import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Acesso do Administrador | ZANKAR Auto Parts" },
      { name: "description", content: "Área restrita do proprietário da loja." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error || !data.user) {
      setErr("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("auth_user_id", data.user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!adminRow) {
      await supabase.auth.signOut();
      setErr("Essa conta não tem acesso ao painel administrativo.");
      setLoading(false);
      return;
    }

    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Lado visual */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black lg:block">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_10%,theme(colors.primary.DEFAULT),transparent_40%),radial-gradient(circle_at_80%_90%,theme(colors.primary.DEFAULT),transparent_45%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between p-10">
            <Link to="/" className="self-start">
              <BrandMark variant="stacked" size="lg" />
            </Link>
            <div>
              <h2 className="font-display text-4xl font-bold leading-tight">
                Gerencie seu catálogo <span className="text-primary">com poucos cliques.</span>
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Produtos, pedidos, clientes e configurações da loja — tudo em um só lugar, pensado
                para ser simples de usar.
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-8 block lg:hidden">
              <BrandMark />
            </Link>

            <h1 className="font-display text-3xl font-bold md:text-4xl">Entrar no painel</h1>
            <p className="mt-2 text-muted-foreground">
              Acesso restrito ao proprietário e equipe da loja.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">E-mail</span>
                <div className="flex items-center rounded-md border border-border bg-input focus-within:border-primary">
                  <Mail className="ml-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@zankar.com.br"
                    className="w-full bg-transparent px-3 py-3 text-base outline-none"
                    autoComplete="username"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Senha</span>
                <div className="flex items-center rounded-md border border-border bg-input focus-within:border-primary">
                  <Lock className="ml-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent px-3 py-3 text-base outline-none"
                    autoComplete="current-password"
                  />
                </div>
              </label>

              {err && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-red px-4 py-3.5 text-base font-bold text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar no painel"} <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">
                ← Voltar para a loja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
