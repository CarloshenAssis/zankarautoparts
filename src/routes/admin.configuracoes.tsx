import { createFileRoute } from "@tanstack/react-router";
import { Upload, Instagram, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CarSilhouette } from "@/components/brand-mark";

export const Route = createFileRoute("/admin/configuracoes")({
  component: ConfigPage,
});

function ConfigPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dados da loja exibidos no catálogo e no WhatsApp
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Logo & nome */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Identidade da loja</h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-gradient-red">
              <CarSilhouette className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-semibold">Logo da loja</Label>
              <p className="text-xs text-muted-foreground">PNG ou JPG, mínimo 200x200px</p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm hover:border-primary"
              >
                <Upload className="h-4 w-4" /> Enviar nova imagem
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="company" className="text-sm font-semibold">
                Nome da empresa
              </Label>
              <Input id="company" defaultValue="ZANKAR Auto Parts" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="cnpj" className="text-sm font-semibold">
                CNPJ
              </Label>
              <Input
                id="cnpj"
                defaultValue="12.345.678/0001-99"
                className="mt-1.5 h-11 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="wpp" className="text-sm font-semibold">
                WhatsApp de atendimento
              </Label>
              <Input id="wpp" defaultValue="(11) 99999-9999" className="mt-1.5 h-11 font-mono" />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-semibold">
                E-mail de contato
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue="contato@zankar.com.br"
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="site" className="text-sm font-semibold">
                Site
              </Label>
              <Input id="site" defaultValue="www.zankar.com.br" className="mt-1.5 h-11" />
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
              <Input id="street" defaultValue="Rua das Indústrias, 123" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="neigh" className="text-sm font-semibold">
                Bairro
              </Label>
              <Input id="neigh" defaultValue="Industrial" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="city" className="text-sm font-semibold">
                Cidade / Estado
              </Label>
              <Input id="city" defaultValue="São Paulo, SP" className="mt-1.5 h-11" />
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
              <Input id="weekdays" defaultValue="08:00 às 18:00" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="sat" className="text-sm font-semibold">
                Sábado
              </Label>
              <Input id="sat" defaultValue="08:00 às 13:00" className="mt-1.5 h-11" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes" className="text-sm font-semibold">
                Observações
              </Label>
              <Textarea
                id="notes"
                defaultValue="Fechado aos domingos e feriados nacionais."
                className="mt-1.5 min-h-20"
              />
            </div>
          </div>
        </section>

        {/* Redes sociais */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Redes sociais</h2>
          <div className="mt-4 grid gap-4">
            <SocialField icon={Instagram} label="Instagram" value="@zankar.autoparts" />
            <SocialField icon={Facebook} label="Facebook" value="facebook.com/zankarautoparts" />
            <SocialField icon={Youtube} label="YouTube" value="youtube.com/@zankarautoparts" />
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" size="lg" className="h-12">
            Cancelar
          </Button>
          <Button size="lg" className="h-12 bg-gradient-red font-bold hover:brightness-110">
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  );
}

function SocialField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Instagram;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
        <Input defaultValue={value} className="mt-1 h-10" />
      </div>
    </div>
  );
}
