import { useMemo, useState } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createVehicleVersion,
  suggestRelatedVersions,
  type VehicleVersion,
} from "@/lib/admin-queries";

export type SelectedVersion = { id: string; label: string };

function versionLabel(v: VehicleVersion) {
  return `${v.marca_nome} ${v.modelo_nome} ${v.nome} (${v.ano_inicio}–${v.ano_fim ?? "atual"})`;
}

export function VehicleCompatibilityPicker({
  allVersions,
  selected,
  onChange,
  onVersionCreated,
}: {
  allVersions: VehicleVersion[];
  selected: SelectedVersion[];
  onChange: (next: SelectedVersion[]) => void;
  onVersionCreated: (v: VehicleVersion) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<VehicleVersion[]>([]);
  const [creating, setCreating] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    marca: "",
    modelo: "",
    versao: "",
    anoInicio: "",
    anoFim: "",
  });

  const selectedIds = new Set(selected.map((s) => s.id));

  const marcaOptions = useMemo(
    () =>
      Array.from(new Set(allVersions.map((v) => v.marca_nome))).sort((a, b) => a.localeCompare(b)),
    [allVersions],
  );

  const modeloOptions = useMemo(
    () =>
      Array.from(
        new Set(
          allVersions.filter((v) => v.marca_nome === newVehicle.marca).map((v) => v.modelo_nome),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [allVersions, newVehicle.marca],
  );

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allVersions
      .filter((v) => versionLabel(v).toLowerCase().includes(q) && !selectedIds.has(v.id))
      .slice(0, 8);
  }, [query, allVersions, selectedIds]);

  async function toggleVersion(v: VehicleVersion) {
    onChange([...selected, { id: v.id, label: versionLabel(v) }]);
    setQuery("");
    const related = await suggestRelatedVersions({ data: v.id });
    setSuggestions(related.filter((r) => !selectedIds.has(r.id) && r.id !== v.id));
  }

  function removeVersion(id: string) {
    onChange(selected.filter((s) => s.id !== id));
  }

  async function submitNewVehicle() {
    if (!newVehicle.marca || !newVehicle.modelo || !newVehicle.versao || !newVehicle.anoInicio)
      return;
    setCreating(true);
    try {
      const result = await createVehicleVersion({
        data: {
          marcaNome: newVehicle.marca,
          modeloNome: newVehicle.modelo,
          versaoNome: newVehicle.versao,
          anoInicio: Number(newVehicle.anoInicio),
          anoFim: newVehicle.anoFim ? Number(newVehicle.anoFim) : null,
        },
      });
      onVersionCreated({
        id: result.id,
        nome: newVehicle.versao,
        ano_inicio: Number(newVehicle.anoInicio),
        ano_fim: newVehicle.anoFim ? Number(newVehicle.anoFim) : null,
        familia: null,
        modelo_nome: newVehicle.modelo,
        marca_nome: newVehicle.marca,
      });
      onChange([...selected, { id: result.id, label: result.label }]);
      setNewVehicle({ marca: "", modelo: "", versao: "", anoInicio: "", anoFim: "" });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium"
            >
              {s.label}
              <button type="button" onClick={() => removeVersion(s.id)} aria-label="Remover">
                <X className="h-3.5 w-3.5 hover:text-destructive" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex items-center rounded-md border border-border bg-input">
          <Search className="ml-3 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar veículo... (ex: Gol)"
            className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
          />
        </div>
        {matches.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
            {matches.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => toggleVersion(v)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
              >
                {versionLabel(v)}
              </button>
            ))}
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Talvez esta peça também sirva em:
          </div>
          <div className="space-y-1.5">
            {suggestions.map((v) => (
              <label key={v.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selected, { id: v.id, label: versionLabel(v) }]);
                      setSuggestions((prev) => prev.filter((s) => s.id !== v.id));
                    }
                  }}
                />
                {versionLabel(v)}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold text-muted-foreground">
          Não achou o veículo? Cadastre direto aqui:
        </p>
        <div className="grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-5">
          <div className="sm:col-span-1">
            <Label className="text-xs">Marca</Label>
            <Select
              value={newVehicle.marca}
              onValueChange={(marca) => setNewVehicle((s) => ({ ...s, marca, modelo: "" }))}
            >
              <SelectTrigger className="mt-1 h-9">
                <SelectValue placeholder="Selecione a marca" />
              </SelectTrigger>
              <SelectContent>
                {marcaOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-1">
            <Label className="text-xs">Modelo</Label>
            <Select
              value={newVehicle.modelo}
              onValueChange={(modelo) => setNewVehicle((s) => ({ ...s, modelo }))}
              disabled={!newVehicle.marca}
            >
              <SelectTrigger className="mt-1 h-9">
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                {modeloOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-1">
            <Label className="text-xs">Versão</Label>
            <Input
              value={newVehicle.versao}
              onChange={(e) => setNewVehicle((s) => ({ ...s, versao: e.target.value }))}
              placeholder="Ex: G5"
              className="mt-1 h-9"
            />
          </div>
          <div className="sm:col-span-1">
            <Label className="text-xs">Ano inicial</Label>
            <Input
              type="number"
              value={newVehicle.anoInicio}
              onChange={(e) => setNewVehicle((s) => ({ ...s, anoInicio: e.target.value }))}
              className="mt-1 h-9"
            />
          </div>
          <div className="sm:col-span-1">
            <Label className="text-xs">Ano final</Label>
            <Input
              type="number"
              value={newVehicle.anoFim}
              onChange={(e) => setNewVehicle((s) => ({ ...s, anoFim: e.target.value }))}
              placeholder="atual"
              className="mt-1 h-9"
            />
          </div>
          <div className="sm:col-span-5">
            <Button type="button" size="sm" onClick={submitNewVehicle} disabled={creating}>
              {creating ? "Salvando..." : "Adicionar veículo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
