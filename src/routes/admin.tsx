import {
  Link,
  useRouterState,
  useNavigate,
  Outlet,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Tags,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Users,
  Settings,
  Search,
  Bell,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { getCurrentAdmin } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const admin = await getCurrentAdmin();
    if (!admin) throw redirect({ to: "/login" });
    return { admin };
  },
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/produtos", label: "Produtos", icon: Package, exact: false },
  { to: "/admin/categorias", label: "Categorias", icon: Tags, exact: false },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag, exact: false },
  { to: "/admin/clientes", label: "Clientes", icon: Users, exact: false },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings, exact: false },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { admin } = Route.useRouteContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const initials = admin.name
    .split(" ")
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-sidebar px-4 py-3 md:px-6">
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-md border border-border md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link to="/admin" className="flex items-center gap-2">
          <BrandMark size="sm" />
          <div className="hidden text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
            Painel Admin
          </div>
        </Link>

        {/* Search */}
        <div className="ml-4 hidden max-w-md flex-1 items-center rounded-md border border-border bg-input md:flex">
          <Search className="ml-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar produtos, pedidos, clientes..."
            className="w-full bg-transparent px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/"
            className="hidden text-sm text-muted-foreground hover:text-primary lg:inline"
          >
            Ver loja →
          </Link>
          <button
            className="relative grid h-10 w-10 place-items-center rounded-md border border-border hover:border-primary"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              3
            </span>
          </button>
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-red text-xs font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-semibold">{admin.name}</div>
              <div className="text-[10px] text-muted-foreground">
                {admin.role === "owner" ? "Proprietário" : "Equipe"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } fixed inset-y-0 left-0 z-20 mt-[64px] w-64 border-r border-border bg-sidebar md:sticky md:top-[64px] md:mt-0 md:block md:h-[calc(100vh-64px)]`}
        >
          <nav className="flex h-full flex-col gap-1 p-3">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-[15px] font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {n.label}
                </Link>
              );
            })}
            <div className="mt-auto border-t border-border pt-3">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-[15px] font-medium text-muted-foreground hover:bg-accent"
              >
                <LogOut className="h-5 w-5" /> Sair
              </button>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminPageTitle({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
