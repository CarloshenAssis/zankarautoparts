import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { categories } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/categorias")({
  component: CategoriasPage,
});

function CategoriasPage() {
  return (
    <div>
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Categorias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize as peças em grupos para facilitar a busca dos clientes
          </p>
        </div>
        <Button size="lg" className="h-12 bg-gradient-red font-bold shrink-0">
          <Plus className="mr-2 h-5 w-5" /> Nova categoria
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.slug}
              className="group rounded-lg border border-border bg-card p-5 transition hover:border-primary"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-md bg-primary/15 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    className="grid h-9 w-9 place-items-center rounded-md border border-border hover:border-primary hover:text-primary"
                    aria-label="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    className="grid h-9 w-9 place-items-center rounded-md border border-border hover:border-destructive hover:text-destructive"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 font-display text-xl font-bold">{c.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {c.count} {c.count === 1 ? "produto cadastrado" : "produtos cadastrados"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
