import { createFileRoute } from "@tanstack/react-router";
import { Upload, Instagram, Facebook, Youtube, KeyRound } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getStoreSettings } from "@/lib/queries";
import { updateStoreSettings } from "@/lib/admin-queries";
import { uploadStoreLogo } from "@/lib/upload";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/configuracoes")({
  loader: async () => ({ storeSettings: await getStoreSettings() }),
  component: ConfigPage,
});

function ConfigPage() {
  const { storeSettings } = Route.useLoaderData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    legalName: storeSettings?.legal_name ?? "",
    cnpj: storeSettings?.cnpj ?? "",
    phoneWhatsapp: storeSettings?.phone_whatsapp ?? "",
    email: storeSettings?.email ?? "",
    website: storeSettings?.website ?? "",
    street: storeSettings?.address?.street ?? "",
    district: storeSettings?.address?.district ?? "",
    city: storeSettings?.address?.city ?? "",
    state: storeSettings?.address?.state ?? "",
    weekdays: storeSettings?.business_hours?.weekdays ?? "",
    saturday: storeSettings?.business_hours?.saturday ?? "",
    notes: storeSettings?.business_hours?.notes ?? "",
    instagram: storeSettings?.social_links?.instagram ?? "",
    facebook: storeSettings?.social_links?.facebook ?? "",
    youtube: storeSettings?.social_links?.youtube ?? "",
    logoUrl: storeSettings?.logo_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    error?: string;
    success?: boolean;
  } | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword.length < 6) {
      setPasswordMessage({ error: "A senha precisa ter pelo menos 6 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ error: "As senhas não coincidem." });
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMessage({ error: error.message });
        return;
      }
      setPasswordMessage({ success: true });
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadStoreLogo(file);
      set("logoUrl", url);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStoreSettings({ data: form });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dados da loja exibidos no catálogo e no WhatsApp
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Logo & nome */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Identidade da loja</h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-gradient-red">
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt="Logo da loja"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-center text-xs font-semibold text-primary-foreground">
                  ZANKAR
                </span>
              )}
            </div>
            <div className="flex-1">
              <Label className="text-sm font-semibold">Logo da loja</Label>
              <p className="text-xs text-muted-foreground">
                Envie a logo customizada da sua loja (PNG, JPG, SVG)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-2 inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm transition hover:bg-primary/10 disabled:opacity-60"
              >
                <Upload className="h-4 w-4" /> {uploading ? "Enviando..." : "Enviar nova imagem"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="company" className="text-sm font-semibold">
                Nome da empresa
              </Label>
              <Input
                id="company"
                value={form.legalName}
                onChange={(e) => set("legalName", e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="cnpj" className="text-sm font-semibold">
                CNPJ
              </Label>
              <Input
                id="cnpj"
                value={form.cnpj}
                onChange={(e) => set("cnpj", e.target.value)}
                className="mt-1.5 h-11 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="wpp" className="text-sm font-semibold">
                WhatsApp de atendimento
              </Label>
              <Input
                id="wpp"
                value={form.phoneWhatsapp}
                onChange={(e) => set("phoneWhatsapp", e.target.value)}
                className="mt-1.5 h-11 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-semibold">
                E-mail de contato
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="site" className="text-sm font-semibold">
                Site
              </Label>
              <Input
                id="site"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Endereço</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="street" className="text-sm font-semibold">
                Rua e número
              </Label>
              <Input
                id="street"
                value={form.street}
                onChange={(e) => set("street", e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="neigh" className="text-sm font-semibold">
                Bairro
              </Label>
              <Input
                id="neigh"
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-sm font-semibold">
                Cidade / Estado
              </Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
          </div>
        </section>

        {/* Horário */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Horário de funcionamento</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="weekdays" className="text-sm font-semibold">
                Segunda a sexta
              </Label>
              <Input
                id="weekdays"
                value={form.weekdays}
                onChange={(e) => set("weekdays", e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="sat" className="text-sm font-semibold">
                Sábado
              </Label>
              <Input
                id="sat"
                value={form.saturday}
                onChange={(e) => set("saturday", e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes" className="text-sm font-semibold">
                Observações
              </Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className="mt-1.5 min-h-20"
              />
            </div>
          </div>
        </section>

        {/* Redes sociais */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Redes sociais</h2>
          <div className="mt-4 grid gap-4">
            <SocialField
              icon={Instagram}
              label="Instagram"
              value={form.instagram}
              onChange={(v) => set("instagram", v)}
            />
            <SocialField
              icon={Facebook}
              label="Facebook"
              value={form.facebook}
              onChange={(v) => set("facebook", v)}
            />
            <SocialField
              icon={Youtube}
              label="YouTube"
              value={form.youtube}
              onChange={(v) => set("youtube", v)}
            />
          </div>
        </section>

        <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-end">
          {saved && <span className="text-sm text-success">Configurações salvas.</span>}
          <Button
            type="submit"
            size="lg"
            className="h-12 bg-gradient-red font-bold hover:brightness-110"
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>

      {/* Trocar senha */}
      <form onSubmit={handleChangePassword} className="mt-6 space-y-6">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <KeyRound className="h-5 w-5 text-primary" /> Trocar senha
          </h2>
          <p className="text-sm text-muted-foreground">Altere a senha de acesso ao painel</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="new-password" className="text-sm font-semibold">
                Nova senha
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="mt-1.5 h-11"
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="text-sm font-semibold">
                Confirmar nova senha
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5 h-11"
                autoComplete="new-password"
              />
            </div>
          </div>

          {passwordMessage?.error && (
            <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {passwordMessage.error}
            </p>
          )}
          {passwordMessage?.success && (
            <p className="mt-4 rounded-md border border-success/40 bg-success/10 px-4 py-2 text-sm text-success">
              Senha alterada com sucesso.
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-4 h-12 bg-gradient-red font-bold hover:brightness-110"
            disabled={changingPassword || !newPassword}
          >
            {changingPassword ? "Alterando..." : "Trocar senha"}
          </Button>
        </section>
      </form>
    </div>
  );
}

function SocialField({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof Instagram;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-10" />
      </div>
    </div>
  );
}
