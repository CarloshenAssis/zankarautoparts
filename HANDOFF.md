# Zankar Auto Parts — Handoff / Status (2026-07-21)

Documento de continuidade para retomar o trabalho em uma nova conversa, focado
exclusivamente no repositório `zankarautoparts` (o `autopecateste` está
concluído e aprovado — serviu de referência de design/UX, ver `PLANEJAMENTO.md`
para o histórico completo dessa decisão).

## Onde estão as coisas

- **Repo**: `CarloshenAssis/zankarautoparts`, branch de trabalho
  `claude/agente-dois-repositorios-ihd1gv`.
- **Plano completo**: `PLANEJAMENTO.md` na raiz do repo (stack, modelo de
  dados, RLS, auth, SEO, infra, fases). Ler antes de continuar.
- **Supabase**: projeto `autopecazankar@gmail.com's Project`,
  `project_id = rqcthyqdolfwemwpqvln`, região `ca-central-1`, Postgres 17.
  Já conectado via MCP nesta conta.
- **Vercel**: repositório **ainda não foi importado/deployado**. O
  `autopecateste` está no Vercel (projeto separado); o `zankarautoparts`
  precisa do mesmo processo (Import Git Repository → framework "TanStack
  Start" é auto-detectado).

## Credenciais

- **Admin do painel** (já criado no Supabase, `admin_users.role = 'owner'`):
  - E-mail: `carloshen.senai@gmail.com`
  - Senha: `123456` (**trocar assim que possível**, foi criada só pra destravar
    o acesso)
- **Supabase (env vars, para `.env.local` local ou secrets do Vercel/GitHub)**:
  ```
  VITE_SUPABASE_URL=https://rqcthyqdolfwemwpqvln.supabase.co
  VITE_SUPABASE_ANON_KEY=sb_publishable_hbvfHpQqIyYpdhQDRnXgeg___fWggTa
  ```
  (chave pública/anon, protegida por RLS — não é segredo, mas ainda assim vai
  em `.env.local`, que é gitignorado). A `SUPABASE_SERVICE_ROLE_KEY` (secreta,
  server-only) ainda não foi gerada/configurada — só é necessária a partir da
  Fase 4 (provisionamento de conta de cliente).

## O que já está pronto (funcional, testado com typecheck+lint+build)

**Fase 1 — Fundação**
- Schema completo no Supabase com RLS em todas as tabelas (ver seção 2-3 do
  `PLANEJAMENTO.md` para o desenho completo): `tenants`, `admin_users`,
  `brands`, `categories`, `products`, `product_images`, `marcas_veiculo`,
  `modelos_veiculo`, `versoes_veiculo`, `produto_compatibilidade`,
  `customers`, `price_tiers`, `addresses`, `orders`, `order_items`,
  `order_status_history`, `store_settings`, `audit_log`.
- Função `is_admin()`, RPC `create_guest_order()` (checkout do visitante,
  valida estoque/preço no servidor, gera número de pedido).
- Bucket `product-images` no Storage (público, escrita admin-only).
- Deploy Vercel configurado replicando exatamente o setup validado no
  `autopecateste` (nitro em `dependencies`, plugin `nitro()` explícito no
  `vite.config.ts` — ver seção 1.2 do `PLANEJAMENTO.md`, são armadilhas reais
  descobertas por tentativa/erro, não mexer sem entender por quê).
- CI no GitHub Actions (`.github/workflows/ci.yml`): lint + typecheck + build
  a cada push/PR. **Falta cadastrar os secrets `VITE_SUPABASE_URL` e
  `VITE_SUPABASE_ANON_KEY` no GitHub** para o build refletir valores reais.

**Fase 2 — Catálogo público**
- Home, `/catalogo` e `/produto/$id` (slug) buscam dados reais via Supabase
  (`src/lib/queries.ts`), zero mock. Busca full-text, filtro por
  categoria/marca, paginação ainda simples (client-side sobre o resultado do
  loader — ok pro volume atual).
- Meta tags dinâmicas (title/description/og:image) por produto.
- `robots.txt` liberando catálogo, bloqueando admin/login/carrinho.
- **Falta**: sitemap.xml dinâmico (Fase 6).

**Fase 3 — Pedido persistido**
- Carrinho continua local (localStorage), mas o checkout chama a RPC
  `create_guest_order` — o pedido é gravado no banco (com número gerado) antes
  de abrir o WhatsApp. Telefone da loja vem de `store_settings` (fonte única).
- Admin → Pedidos mostra os pedidos reais, com botão para avançar status.

**Fase 5 — Admin CRUD (parcial)**
- **Produtos**: CRUD completo (criar/editar/excluir), upload de imagem real
  pro Storage, **compatibilidade de veículo integrada** (busca/autocomplete,
  checkbox, sugestão automática por família de plataforma, cadastro manual de
  veículo novo) — exatamente o fluxo detalhado por você no chat anterior, ver
  seção 2.1.1 do `PLANEJAMENTO.md`.
- **Categorias**: criar/excluir reais (editar ainda é só visual).
- **Configurações da loja**: formulário persiste em `store_settings` de
  verdade.
- **Dashboard**: métricas reais (produtos, categorias, pedidos de hoje, mais
  visualizado, pedidos/produtos recentes). O gráfico fake de "acessos" foi
  removido (não existe instrumentação real por trás ainda).

## O que falta (nessa ordem, seguindo o plano)

1. ~~**Importar o repo no Vercel** e cadastrar as env vars~~ — feito, deploy
   aprovado pelo cliente. `main` já é a branch de produção na Vercel.
   Pendente menor: cadastrar `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`
   como secrets no GitHub Actions (o CI builda hoje com valores vazios).
2. **Clientes (Fase 4)**: conta de cliente com login/senha, criada só pelo
   lojista (não é autocadastro), fluxo de convite por e-mail. Depende de
   configurar o **Resend** (ou SMTP do Supabase) — ainda não escolhido/feito.
   A tela `/admin/clientes` ainda está 100% em `src/lib/mock-data.ts`.
3. **Editar categoria** (só criar/excluir estão reais).
4. **Sitemap.xml dinâmico + resto do polish de SEO/performance** (Fase 6).
5. **Ajuste da logo** — o cliente já avisou que a logo atual está errada e
   será trocada antes de produção (não bloqueia nada, é cosmético, fica pro
   fim).
6. Nenhum produto real foi cadastrado ainda — o CRUD já permite fazer isso
   pelo painel assim que houver uma conta admin logada.
7. **Base de veículos (marcas/modelos/versões) para compatibilidade** —
   **lotes 1 e 2 aplicados**: 14 marcas, 147 modelos, 248 versões em
   `marcas_veiculo`/`modelos_veiculo`/`versoes_veiculo`. Lote 1
   (`data/vehicles-seed/lote1.json`): linha de entrada (Gol, Uno, Onix,
   HB20 etc.) das mesmas 14 marcas, Nissan/Mitsubishi/Kia/Jeep parciais.
   Lote 2 (`data/vehicles-seed/lote2.json`): picapes compactas/médias,
   SUVs/crossovers e furgões de passeio dessas mesmas marcas (Amarok,
   Tiguan, Territory, Maverick, RAV4, Santa Fe, Koleos, Trailblazer etc.) —
   nenhuma marca nova, só modelos novos. Corrigiu também uma entrada
   genérica do Peugeot Partner do lote 1 (via `UPDATE`, não duplicou).
   Schema não precisou de migration nova (`versoes_veiculo.familia` já
   existia para a sugestão automática por plataforma da seção 2.1.1 do
   `PLANEJAMENTO.md`).
   **Falta**: lote 3 (Nissan/Mitsubishi/Kia/Jeep detalhados + marcas de
   segundo escalão: Suzuki, Caoa Chery, JAC, BYD, GWM, Land Rover,
   Mercedes/BMW/Audi de entrada). Fluxo pra aplicar um lote novo:
   1. Salvar o JSON em `data/vehicles-seed/loteN.json` (mesmo formato de
      `lote1.json`: `[{marca, modelos:[{modelo, versoes:[{nome, ano_inicio,
      ano_fim, motorizacao, combustivel, plataforma}]}]}]`).
   2. Rodar `bun scripts/seed-vehicles/generate-sql.mjs data/vehicles-seed/loteN.json > /tmp/seed.sql`.
   3. Aplicar o SQL gerado via MCP do Supabase (`execute_sql`), em pedaços
      (o arquivo gerado fica grande — aplicar por marca/bloco evita
      estourar o limite de uma única chamada).
   Lembrete de produto (confirmado pelo cliente): essa base é só o
   catálogo de veículos existentes — `produto_compatibilidade` (peça↔veículo)
   nunca é populada automaticamente por este seed. A vinculação é sempre
   manual pelo lojista na tela de produto; o sistema no máximo sugere
   candidatos não marcados por família/plataforma, nunca confirma sozinho.

## Nota importante sobre o ambiente

O sandbox onde este trabalho foi feito tem uma política de rede que **bloqueia
acesso direto ao host do Supabase** a partir de processos comuns (dev server,
`curl`) — só as ferramentas MCP do Supabase conseguem falar com o projeto.
Por isso não foi possível abrir o app rodando com dado real e mostrar
visualmente nesta sessão (só consegui mostrar a tela de login, que não
depende de fetch). Isso é uma característica *deste ambiente específico*, não
do código — rodando localmente ou no Vercel (que têm acesso de rede normal),
não deve acontecer. Se a próxima sessão rodar num ambiente com rede aberta,
vale testar de ponta a ponta (login real, cadastro de produto, fluxo de
compra) antes de seguir para as próximas fases.

## Estrutura do código (visão rápida)

```
src/lib/
  supabase/client.ts, supabase/server.ts   # clientes browser/SSR
  queries.ts                                # leituras públicas (catálogo)
  admin-queries.ts                          # CRUD/leituras admin-only
  auth.ts                                   # getCurrentAdmin() (guarda de rota)
  types.ts, database.types.ts               # tipos (database.types.ts é o
                                             #  gerado do schema, ainda não
                                             #  wired em createClient<Database>,
                                             #  ver comentário no arquivo)
  cart.tsx, checkout.ts, upload.ts, storage.ts, icon-map.tsx, utils.ts
src/components/
  brand-mark.tsx, site-header.tsx, site-footer.tsx, product-card.tsx
  vehicle-compatibility-picker.tsx          # widget de compatibilidade
  admin/product-form.tsx                    # form compartilhado criar/editar
  ui/*                                      # shadcn (só os componentes usados)
src/routes/                                 # file-based routing (TanStack Router)
  index.tsx, catalogo.tsx, produto.$id.tsx, carrinho.tsx, login.tsx
  admin.tsx (layout+guard), admin.index.tsx (dashboard),
  admin.produtos.index.tsx / .novo.tsx / .$id.tsx,
  admin.categorias.tsx, admin.configuracoes.tsx, admin.pedidos.tsx,
  admin.clientes.tsx (ainda mock)
```

Design system (paleta, tipografia Montserrat, `BrandMark`) foi portado 1:1 do
`autopecateste` conforme pedido — nada de redesenho aqui.
