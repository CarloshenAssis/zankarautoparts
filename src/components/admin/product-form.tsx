import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload, X, ImagePlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
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
import {
  VehicleCompatibilityPicker,
  type SelectedVersion,
} from "@/components/vehicle-compatibility-picker";
import {
  createProduct,
  createVehicleVersion,
  updateProduct,
  type ProductInput,
  type VehicleVersion,
} from "@/lib/admin-queries";
import { productImageUrl } from "@/lib/storage";
import { uploadProductImage } from "@/lib/upload";

type ImageState = { file?: File; previewUrl: string; storagePath?: string };

export function ProductForm({
  mode,
  productId,
  initial,
  marcasVeiculo,
  brands,
  categories,
  allVersions,
}: {
  mode: "create" | "edit";
  productId?: string;
  initial?: {
    name: string;
    sku: string;
    brandId: string | null;
    categoryId: string | null;
    price: number;
    stockQuantity: number;
    description: string;
    descriptionShort: string;
    status: "draft" | "active" | "archived";
    featured: boolean;
    compatibility: SelectedVersion[];
    images: { storage_path: string; is_primary: boolean }[];
  };
  marcasVeiculo: { id: string; nome: string }[];
  brands: { id: string; name: string }[];
  categories: { id: string; name: string; slug: string }[];
  allVersions: VehicleVersion[];
}) {
  const navigate = useNavigate();
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [brandId, setBrandId] = useState(initial?.brandId ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [descriptionShort, setDescriptionShort] = useState(initial?.descriptionShort ?? "");
  const [inStock, setInStock] = useState((initial?.stockQuantity ?? 0) > 0);
  const [stockQuantity, setStockQuantity] = useState(String(initial?.stockQuantity ?? 1));
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [versions, setVersions] = useState(allVersions);

  // Veículo principal: obrigatório, é sempre o primeiro item de compatibilidade.
  const initialPrimary = initial?.compatibility[0]
    ? versions.find((v) => v.id === initial.compatibility[0].id)
    : undefined;
  const [primaryMarca, setPrimaryMarca] = useState(initialPrimary?.marca_nome ?? "");
  const [primaryModelo, setPrimaryModelo] = useState(initialPrimary?.modelo_nome ?? "");
  const [primaryVersaoId, setPrimaryVersaoId] = useState(initial?.compatibility[0]?.id ?? "");
  const [primaryAno, setPrimaryAno] = useState<number | null>(
    initial?.compatibility[0]?.ano ?? null,
  );
  const [showNewVersaoForm, setShowNewVersaoForm] = useState(false);
  const [newVersao, setNewVersao] = useState({ nome: "", anoInicio: "", anoFim: "" });
  const [creatingVersao, setCreatingVersao] = useState(false);

  // Outros veículos (além do principal), opcional.
  const [otherCompatibility, setOtherCompatibility] = useState<SelectedVersion[]>(
    initial?.compatibility.slice(1) ?? [],
  );
  const [hasOtherVehicles, setHasOtherVehicles] = useState(
    initial ? initial.compatibility.length > 1 : false,
  );

  const [images, setImages] = useState<ImageState[]>(
    (initial?.images ?? []).map((img) => ({
      storagePath: img.storage_path,
      previewUrl: productImageUrl(img.storage_path),
    })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const marcaVeiculoId = marcasVeiculo.find((m) => m.nome === primaryMarca)?.id ?? "";

  const primaryMarcaOptions = useMemo(
    () => Array.from(new Set(versions.map((v) => v.marca_nome))).sort((a, b) => a.localeCompare(b)),
    [versions],
  );
  const primaryModeloOptions = useMemo(
    () =>
      Array.from(
        new Set(versions.filter((v) => v.marca_nome === primaryMarca).map((v) => v.modelo_nome)),
      ).sort((a, b) => a.localeCompare(b)),
    [versions, primaryMarca],
  );
  const primaryVersaoOptions = useMemo(
    () =>
      versions
        .filter((v) => v.marca_nome === primaryMarca && v.modelo_nome === primaryModelo)
        .sort((a, b) => a.ano_inicio - b.ano_inicio),
    [versions, primaryMarca, primaryModelo],
  );
  const primaryVersaoYears = useMemo(() => {
    const v = versions.find((v) => v.id === primaryVersaoId);
    if (!v) return [];
    const end = v.ano_fim ?? new Date().getFullYear() + 1;
    const years: number[] = [];
    for (let y = end; y >= v.ano_inicio; y--) years.push(y);
    return years;
  }, [versions, primaryVersaoId]);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...next]);
  }

  async function submitNewPrimaryVersao() {
    if (!primaryMarca || !primaryModelo || !newVersao.nome.trim() || !newVersao.anoInicio) return;
    setCreatingVersao(true);
    try {
      const result = await createVehicleVersion({
        data: {
          marcaNome: primaryMarca,
          modeloNome: primaryModelo,
          versaoNome: newVersao.nome,
          anoInicio: Number(newVersao.anoInicio),
          anoFim: newVersao.anoFim ? Number(newVersao.anoFim) : null,
        },
      });
      setVersions((prev) => [
        ...prev,
        {
          id: result.id,
          nome: newVersao.nome,
          ano_inicio: Number(newVersao.anoInicio),
          ano_fim: newVersao.anoFim ? Number(newVersao.anoFim) : null,
          familia: null,
          modelo_nome: primaryModelo,
          marca_nome: primaryMarca,
        },
      ]);
      setPrimaryVersaoId(result.id);
      setNewVersao({ nome: "", anoInicio: "", anoFim: "" });
      setShowNewVersaoForm(false);
    } finally {
      setCreatingVersao(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !sku.trim() || !price || !primaryVersaoId) {
      setError("Preencha nome, código, preço e o veículo principal (marca/modelo/versão).");
      return;
    }
    setSaving(true);
    try {
      const uploadedPaths = await Promise.all(
        images.map(async (img) => img.storagePath ?? (await uploadProductImage(img.file!))),
      );

      const payload: ProductInput = {
        name,
        sku,
        marcaVeiculoId: marcaVeiculoId || null,
        brandId: brandId || null,
        categoryId: categoryId || null,
        price: Number(price),
        stockQuantity: inStock ? Number(stockQuantity) || 0 : 0,
        description,
        descriptionShort,
        status: "active",
        featured,
        compatibility: [
          { versaoId: primaryVersaoId, anoEspecifico: primaryAno },
          ...otherCompatibility.map((c) => ({ versaoId: c.id, anoEspecifico: c.ano ?? null })),
        ],
        images: uploadedPaths.map((storagePath, i) => ({ storagePath, isPrimary: i === 0 })),
      };

      if (mode === "create") {
        await createProduct({ data: payload });
      } else {
        await updateProduct({ data: { id: productId!, ...payload } });
      }
      navigate({ to: "/admin/produtos" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/admin/produtos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para produtos
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          {mode === "create" ? "Novo produto" : "Editar produto"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha os dados abaixo para{" "}
          {mode === "create" ? "cadastrar uma nova peça" : "atualizar a peça"} no catálogo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Informações da peça</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Nome da peça
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Farol Dianteiro LED Cristal"
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="code" className="text-sm font-semibold">
                Código interno
              </Label>
              <Input
                id="code"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ex: FR-2451"
                className="mt-1.5 h-11 font-mono"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Marca (do carro)</Label>
              <Select
                value={primaryMarca}
                onValueChange={(marca) => {
                  setPrimaryMarca(marca);
                  setPrimaryModelo("");
                  setPrimaryVersaoId("");
                  setShowNewVersaoForm(false);
                }}
              >
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent>
                  {primaryMarcaOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Modelo (do carro)</Label>
              <Select
                value={primaryModelo}
                onValueChange={(modelo) => {
                  setPrimaryModelo(modelo);
                  setPrimaryVersaoId("");
                  setShowNewVersaoForm(false);
                }}
                disabled={!primaryMarca}
              >
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  {primaryModeloOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Versão</Label>
              <Select
                value={primaryVersaoId || (showNewVersaoForm ? "__new__" : "")}
                onValueChange={(v) => {
                  if (v === "__new__") {
                    setShowNewVersaoForm(true);
                    setPrimaryVersaoId("");
                  } else {
                    setPrimaryVersaoId(v);
                    setShowNewVersaoForm(false);
                  }
                  setPrimaryAno(null);
                }}
                disabled={!primaryModelo}
              >
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent>
                  {primaryVersaoOptions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nome} ({v.ano_inicio}–{v.ano_fim ?? "atual"})
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">+ Cadastrar nova versão...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {primaryVersaoYears.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Ano específico (opcional)</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Use quando a peça serve só para um ano dentro do período da versão (ajuda no SEO).
                </p>
                <Select
                  value={primaryAno ? String(primaryAno) : "__all__"}
                  onValueChange={(v) => setPrimaryAno(v === "__all__" ? null : Number(v))}
                >
                  <SelectTrigger className="mt-1.5 h-11">
                    <SelectValue placeholder="Todos os anos da versão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todos os anos da versão</SelectItem>
                    {primaryVersaoYears.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        Somente {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showNewVersaoForm && (
              <div className="md:col-span-2 grid gap-3 rounded-md border border-border bg-background p-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Nome da versão</Label>
                  <Input
                    value={newVersao.nome}
                    onChange={(e) => setNewVersao((s) => ({ ...s, nome: e.target.value }))}
                    placeholder="Ex: G5"
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Ano inicial</Label>
                  <Input
                    type="number"
                    value={newVersao.anoInicio}
                    onChange={(e) => setNewVersao((s) => ({ ...s, anoInicio: e.target.value }))}
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Ano final</Label>
                  <Input
                    type="number"
                    value={newVersao.anoFim}
                    onChange={(e) => setNewVersao((s) => ({ ...s, anoFim: e.target.value }))}
                    placeholder="atual"
                    className="mt-1 h-9"
                  />
                </div>
                <div className="sm:col-span-4">
                  <Button
                    type="button"
                    size="sm"
                    onClick={submitNewPrimaryVersao}
                    disabled={creatingVersao}
                  >
                    {creatingVersao ? "Salvando..." : "Usar esta versão"}
                  </Button>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="cat" className="text-sm font-semibold">
                Categoria
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="cat" className="mt-1.5 h-11">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                className="mt-1.5 h-11"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-semibold">
                Esta peça também serve para outros veículos?
              </Label>
              <div className="mt-1.5 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={hasOtherVehicles ? "default" : "outline"}
                  className={hasOtherVehicles ? "bg-gradient-red" : ""}
                  onClick={() => setHasOtherVehicles(true)}
                >
                  Sim
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!hasOtherVehicles ? "default" : "outline"}
                  className={!hasOtherVehicles ? "bg-gradient-red" : ""}
                  onClick={() => {
                    setHasOtherVehicles(false);
                    setOtherCompatibility([]);
                  }}
                >
                  Não, só este
                </Button>
              </div>
            </div>
            {hasOtherVehicles && (
              <div className="md:col-span-2">
                <Label className="text-sm font-semibold">Outros veículos compatíveis</Label>
                <div className="mt-1.5">
                  <VehicleCompatibilityPicker
                    allVersions={versions.filter((v) => v.id !== primaryVersaoId)}
                    selected={otherCompatibility}
                    onChange={setOtherCompatibility}
                    onVersionCreated={(v) => setVersions((prev) => [...prev, v])}
                    primaryVersionId={primaryVersaoId}
                  />
                </div>
              </div>
            )}
            <div className="md:col-span-2">
              <Label htmlFor="desc-short" className="text-sm font-semibold">
                Descrição curta / informações adicionais
              </Label>
              <Input
                id="desc-short"
                value={descriptionShort}
                onChange={(e) => setDescriptionShort(e.target.value)}
                placeholder="Ex: Garantia 12 meses. Não acompanha lâmpadas."
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="brand" className="text-xs text-muted-foreground">
                Marca da peça (opcional)
              </Label>
              <Select value={brandId} onValueChange={setBrandId}>
                <SelectTrigger id="brand" className="mt-1.5 h-9 text-sm">
                  <SelectValue placeholder="Fabricante da peça" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="desc" className="text-sm font-semibold">
                Descrição
              </Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a peça, material, aplicação..."
                className="mt-1.5 min-h-28"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Imagens do produto</h2>
          <p className="text-sm text-muted-foreground">
            Envie múltiplas fotos. A primeira será a capa.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <div
                key={img.previewUrl}
                className="group relative aspect-square overflow-hidden rounded-md border border-border bg-gradient-to-br from-[#2a1f35] via-[#1f1f1f] to-[#0f0f12]"
              >
                <img src={img.previewUrl} alt="" className="h-full w-full object-contain p-2" />
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
            <label className="grid aspect-square cursor-pointer place-items-center rounded-md border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary">
              <div className="flex flex-col items-center gap-1">
                <ImagePlus className="h-8 w-8" />
                <span className="text-xs font-semibold">Adicionar</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </label>
          </div>

          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm hover:border-primary">
            <Upload className="h-4 w-4" /> Selecionar arquivos do dispositivo
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
        </section>

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
              <Input
                id="qty"
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="mt-1.5 h-11 max-w-xs"
              />
            </div>
          )}
          <div className="mt-4 flex items-center justify-between rounded-md border border-border bg-background p-4">
            <div>
              <div className="font-semibold">Produto em destaque</div>
              <div className="text-xs text-muted-foreground">
                Aparece na seção de destaque da home.
              </div>
            </div>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>
        </section>

        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" size="lg" className="h-12">
            <Link to="/admin/produtos">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            className="h-12 bg-gradient-red font-bold hover:brightness-110"
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar produto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
