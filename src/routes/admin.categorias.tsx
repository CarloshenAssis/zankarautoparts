import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus, Edit2, Trash2, Sparkles } from "lucide-react";
import { useState } from "react";
import { getCategories } from "@/lib/queries";
import { categoryIcon } from "@/lib/icon-map";
import { createCategory, updateCategory, deleteCategory, seedMainCategories } from "@/lib/admin-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/categorias")({
  loader: async () => ({ categories: await getCategories() }),
  component: CategoriasPage,
});

const ICON_OPTIONS = ["lightbulb", "radio", "eye", "shield", "car-front", "wrench"];

function CategoriasPage() {
  const router = useRouter();
  const { categories } = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState(ICON_OPTIONS[0]);

  async function handleSeedCategories() {
    if (!confirm("Adicionar 18 categorias principais do mercado?")) return;
    setSeeding(true);
    try {
      await seedMainCategories();
      router.invalidate();
    } finally {
      setSeeding(false);
    }
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createCategory({ data: { name, icon } });
      setName("");
      setOpen(false);
      router.invalidate();
    } finally {
      setSaving(false);
    }
  }

  function handleEditOpen(c: { id: string; name: string; icon: string | null }) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditIcon(c.icon || ICON_OPTIONS[0]);
  }

  async function handleUpdate() {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    try {
      await updateCategory({ data: { id: editingId, name: editName, icon: editIcon } });
      setEditingId(null);
      router.invalidate();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir a categoria "${name}"?`)) return;
    await deleteCategory({ data: id });
    router.invalidate();
  }

  return (
    <div>
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Categorias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize as peças em grupos para facilitar a busca dos clientes
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            onClick={handleSeedCategories}
            disabled={seeding}
            variant="outline"
            size="lg"
            className="h-12 font-bold"
          >
            <Sparkles className="mr-2 h-5 w-5" /> {seeding ? "Adicionando..." : "Adicionar principais"}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-12 bg-gradient-red font-bold shrink-0">
                <Plus className="mr-2 h-5 w-5" /> Nova categoria
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="cat-name">Nome</Label>
                <Input
                  id="cat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Suspensão"
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger className="mt-1.5 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={saving} className="bg-gradient-red">
                {saving ? "Salvando..." : "Criar categoria"}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={editingId !== null} onOpenChange={(v) => !v && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="cat-edit-name">Nome</Label>
              <Input
                id="cat-edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label>Ícone</Label>
              <Select value={editIcon} onValueChange={setEditIcon}>
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} disabled={saving} className="bg-gradient-red">
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
          Nenhuma categoria cadastrada ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const Icon = categoryIcon(c.icon);
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
                      onClick={() => handleEditOpen(c)}
                      className="grid h-9 w-9 place-items-center rounded-md border border-border hover:border-primary hover:text-primary"
                      aria-label="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="grid h-9 w-9 place-items-center rounded-md border border-border hover:border-destructive hover:text-destructive"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 font-display text-xl font-bold">{c.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {c.product_count}{" "}
                  {c.product_count === 1 ? "produto cadastrado" : "produtos cadastrados"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
