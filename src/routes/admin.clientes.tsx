import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Search, Phone, Mail, Plus, Trash2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { getCustomers, createCustomerAccount, deleteCustomer } from "@/lib/admin-queries";
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

export const Route = createFileRoute("/admin/clientes")({
  loader: async () => ({ customers: await getCustomers() }),
  component: ClientesPage,
});

function randomPassword(): string {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
}

function ClientesPage() {
  const router = useRouter();
  const { customers } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [password, setPassword] = useState(randomPassword());

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setDocumentNumber("");
    setPassword(randomPassword());
    setErrorMsg("");
    setCopied(false);
  }

  async function handleCreate() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setErrorMsg("Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      await createCustomerAccount({
        data: { name, email, phone, document: documentNumber, password },
      });
      setOpen(false);
      resetForm();
      router.invalidate();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Não foi possível criar a conta.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover o cliente "${name}"?`)) return;
    await deleteCustomer({ data: id });
    router.invalidate();
  }

  function copyCredentials() {
    navigator.clipboard.writeText(`E-mail: ${email}\nSenha: ${password}`);
    setCopied(true);
  }

  return (
    <div>
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Contas de cliente com acesso à loja (login e senha cadastrados por você)
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="lg" className="h-12 shrink-0 bg-gradient-red font-bold">
              <Plus className="mr-2 h-5 w-5" /> Novo cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova conta de cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="cust-name">Nome</Label>
                <Input
                  id="cust-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo ou razão social"
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label htmlFor="cust-email">E-mail (login)</Label>
                <Input
                  id="cust-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label htmlFor="cust-phone">Telefone</Label>
                <Input
                  id="cust-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98123-4501"
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label htmlFor="cust-document">CPF/CNPJ (opcional)</Label>
                <Input
                  id="cust-document"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label htmlFor="cust-password">Senha</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    id="cust-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0"
                    onClick={() => setPassword(randomPassword())}
                  >
                    Gerar
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Anote ou copie essa senha para enviar ao cliente — ela não fica salva em texto
                  puro depois de criada.
                </p>
              </div>
              {errorMsg && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMsg}
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={copyCredentials}
                disabled={!email || !password}
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copiado" : "Copiar credenciais"}
              </Button>
              <Button onClick={handleCreate} disabled={saving} className="bg-gradient-red">
                {saving ? "Criando..." : "Criar conta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center rounded-md border border-border bg-input">
            <Search className="ml-3 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Nenhum cliente cadastrado ainda.
          </p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-sidebar/50">
                  <tr className="text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Contato</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Cadastrado em</th>
                    <th className="w-16 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-accent/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                            {c.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div className="min-w-0 font-semibold">{c.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          {c.email && (
                            <span className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3" /> {c.email}
                            </span>
                          )}
                          {c.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3" /> {c.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            c.status === "active"
                              ? "bg-success/15 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {c.status === "active" ? "Ativo" : c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:border-destructive hover:text-destructive"
                          aria-label="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-border md:hidden">
              {filtered.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{c.name}</div>
                      {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                    </div>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="grid h-10 w-10 place-items-center rounded-md border border-border hover:border-destructive hover:text-destructive"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {c.phone && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
