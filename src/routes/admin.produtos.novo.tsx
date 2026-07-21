import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Upload, X, ImagePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { categories, brands } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/produtos/novo")({
  component: NovoProdutoPage,
});

function NovoProdutoPage() {
  const [inStock, setInStock] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  const addImage = () => {
    const grads = [
      "from-[#6c2bd9] via-[#4b1e78] to-[#1f1f1f]",
      "from-[#2a2440] via-[#4b1e78] to-[#141018]",
      "from-[#8a8aba] via-[#ffffff] to-[#5c5c7a]",
    ];
    setImages((arr) => [...arr, grads[arr.length % grads.length]]);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/admin/produtos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para produtos
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Novo produto</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha os dados abaixo para cadastrar uma nova peça no catálogo.
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Info */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Informações da peça</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Nome da peça
              </Label>
              <Input
                id="name"
                placeholder="Ex: Farol Dianteiro LED Cristal"
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="code" className="text-sm font-semibold">
                Código interno
              </Label>
              <Input id="code" placeholder="Ex: FR-2451" className="mt-1.5 h-11 font-mono" />
            </div>
            <div>
              <Label htmlFor="brand" className="text-sm font-semibold">
                Marca
              </Label>
              <Select>
                <SelectTrigger id="brand" className="mt-1.5 h-11">
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cat" className="text-sm font-semibold">
                Categoria
              </Label>
              <Select>
                <SelectTrigger id="cat" className="mt-1.5 h-11">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price" className="text-sm font-semibold">
                Preço (R$)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0,00"
                className="mt-1.5 h-11"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="compat" className="text-sm font-semibold">
                Compatibilidade
              </Label>
              <Input
                id="compat"
                placeholder="Ex: Gol G6 2013-2016; Voyage 2013-2016"
                className="mt-1.5 h-11"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Separe múltiplos veículos com ponto e vírgula.
              </p>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="desc" className="text-sm font-semibold">
                Descrição
              </Label>
              <Textarea
                id="desc"
                placeholder="Descreva a peça, material, aplicação..."
                className="mt-1.5 min-h-28"
              />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Imagens do produto</h2>
          <p className="text-sm text-muted-foreground">
            Envie múltiplas fotos. A primeira será a capa.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((g, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-md border border-border"
              >
                <div className={`h-full w-full bg-gradient-to-br ${g}`} />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Capa
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setImages((a) => a.filter((_, idx) => idx !== i))}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addImage}
              className="grid aspect-square place-items-center rounded-md border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <div className="flex flex-col items-center gap-1">
                <ImagePlus className="h-8 w-8" />
                <span className="text-xs font-semibold">Adicionar</span>
              </div>
            </button>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm hover:border-primary"
          >
            <Upload className="h-4 w-4" /> Selecionar arquivos do dispositivo
          </button>
        </section>

        {/* Stock */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Estoque</h2>
          <div className="mt-4 flex items-center justify-between rounded-md border border-border bg-background p-4">
            <div>
              <div className="font-semibold">Produto em estoque</div>
              <div className="text-xs text-muted-foreground">
                Peças fora de estoque ficam marcadas como "Sob consulta" no catálogo.
              </div>
            </div>
            <Switch checked={inStock} onCheckedChange={setInStock} />
          </div>
          {inStock && (
            <div className="mt-4">
              <Label htmlFor="qty" className="text-sm font-semibold">
                Quantidade disponível
              </Label>
              <Input id="qty" type="number" defaultValue={1} className="mt-1.5 h-11 max-w-xs" />
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" size="lg" className="h-12">
            <Link to="/admin/produtos">Cancelar</Link>
          </Button>
          <Button size="lg" className="h-12 bg-gradient-red font-bold hover:brightness-110">
            Salvar produto
          </Button>
        </div>
      </form>
    </div>
  );
}
