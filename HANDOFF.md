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
  seção 2.1.1 do `PLANEJAMENTO.md`. **Marca do produto = marca do veículo**
  (Volkswagen, Fiat...), campo obrigatório, select puxando de
  `marcas_veiculo` (coluna `products.marca_veiculo_id`, migration
  `0011_products_marca_veiculo`). A marca da peça (fabricante, ex: Arteb) é
  um campo secundário opcional (`products.brand_id` → `brands`, já
  existia). Isso vale em tudo: card de produto, página do produto e filtro
  do catálogo público mostram/filtram por marca de veículo; marca da peça
  só aparece como informação secundária quando preenchida.
- **Ano específico por veículo compatível** (`produto_compatibilidade.ano_especifico`,
  migration `0013_produto_compatibilidade_ano_especifico`): além do
  intervalo de anos da versão (ex: 2012–2018), o formulário deixa marcar
  "Somente 2015" quando a peça (ex: um farol) serve só para um ano
  específico dentro do período — ajuda o SEO/busca a bater exatamente com
  o carro do comprador. Vale tanto pro veículo principal quanto pros
  "outros veículos" adicionados depois. Mostrado no card, na página do
  produto e no admin.
- Na tela de cadastro de peça, "Possíveis compatíveis" (sugestão automática
  por família/plataforma) agora reage ao veículo principal selecionado no
  topo do formulário, não ao último veículo adicionado manualmente na lista
  de "outros veículos".
- **Categorias**: CRUD completo (criar/editar/excluir, todos reais).
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
2. ~~**Clientes (Fase 4)**~~ — feito, mas com fluxo simplificado (decisão do
   cliente): em vez do convite por e-mail original (que dependia de
   Resend/SMTP, nunca configurado), o lojista agora cria a conta do cliente
   já com e-mail e senha definidos na hora, direto em `/admin/clientes`
   (`createCustomerAccount` em `src/lib/admin-queries.ts`). Usa
   `createSupabaseServiceClient()` (service role) para criar o usuário no
   Supabase Auth com `email_confirm: true` — **por isso
   `SUPABASE_SERVICE_ROLE_KEY` precisa estar configurado em
   `.env.local`/secrets do Vercel para essa tela funcionar**, é a primeira
   feature que de fato usa essa chave. A checagem de que quem chama é um
   admin autenticado é feita dentro do próprio `createCustomerAccount`
   (`getCurrentAdmin()`), já que o client de service role ignora RLS. O
   registro em `customers` usa `customer_type: 'account'`,
   `status: 'active'`, `activated_at` = agora (sem os campos de convite
   `invite_token_hash`/`invited_at` do desenho original — continuam na
   tabela mas não são mais usados por esse fluxo). Cliente loga em
   `/conta/entrar` (`getCurrentCustomer()` em `src/lib/auth.ts`, mesmo
   padrão do `/login` do admin mas checando a tabela `customers`) e cai
   numa área mínima em `/conta` (nome, e-mail, link pro catálogo, sair) —
   não tem histórico de pedidos ainda, é só a casca de acesso. Link "Minha
   conta" adicionado no header (desktop e mobile). Página de admin
   (`admin.clientes.tsx`) tem dialog de criação com campo de senha (input
   editável + botão "Gerar" senha aleatória + "Copiar credenciais" pra
   lojista repassar por WhatsApp) e lista real via `getCustomers()`
   (`src/lib/mock-data.ts` não é mais usado aqui).
3. ~~**Editar categoria**~~ — feito, CRUD completo.
4. ~~**Sitemap.xml dinâmico**~~ — feito. `src/server.ts` intercepta
   `/sitemap.xml` antes de delegar pro handler do TanStack Start (essa
   versão do `@tanstack/react-start`/`router-plugin` ainda não tem rotas de
   API/server nativas via arquivo, então a interceptação manual no fetch
   handler é o jeito confiável de servir XML com content-type correto).
   Gerado por `src/lib/sitemap.ts` (produtos ativos + categorias, usando um
   client Supabase anônimo direto, sem depender do contexto de cookies da
   request). Resto do polish de SEO/performance da Fase 6 ainda em aberto.
   Também corrigido nessa leva: a página de produto agora tem duas rotas de
   arquivo (`produto.$id.tsx` genérico e `produto.$id.$modeloSlug.tsx` por
   veículo — Modelo 1 vs Modelo 2 da estratégia de SEO condicional por
   número de compatibilidades, ≤4 veículos ganha URL específica com
   canonical apontando pra genérica, >4 fica só na genérica). UI
   compartilhada extraída pra `src/components/product-detail-page.tsx`. O
   slug de veículo na URL usa as colunas `slug` reais de
   `marcas_veiculo`/`modelos_veiculo` (não reconstrói a partir do nome de
   exibição — nomes como "Le Baron / Magnum" quebravam slug se
   reconstruídos ingenuamente a partir do texto). Corrigido também um bug
   real do canonical: estava sendo devolvido dentro do array `meta` do
   `head()` (`{ rel: "canonical", href }`), mas `rel`/`href` são atributos
   de `<link>`, não de `<meta>` — nunca teria virado uma tag `<link
rel="canonical">` de verdade. Agora vai na chave `links` (mesmo padrão
   do `__root.tsx`). Adicionado também JSON-LD `Product` (preço,
   disponibilidade, marca, compatibilidade em `additionalProperty`) via
   `{ "script:ld+json": {...} }` na meta — suporte nativo do TanStack
   Router pra isso, não precisou de lib extra. Também adicionado
   `loading`/`decoding` em todas as `<img>` públicas (catálogo, carrinho,
   galeria de produto): `lazy` nas abaixo da dobra, e a imagem principal da
   página de produto (candidata a LCP) com `loading="eager"` +
   `fetchPriority="high"`. Upload de imagem já gravava
   `cacheControl: "31536000"` no Storage desde antes, não precisou mexer.
   Resto do polish de performance da Fase 6 (ex: `hreflang` — não se aplica
   aqui, site é só pt-BR) fica pra quando houver algo concreto a otimizar.
5. **Ajuste da logo** — o cliente já avisou que a logo atual está errada e
   será trocada antes de produção (não bloqueia nada, é cosmético, fica pro
   fim).
6. Nenhum produto real foi cadastrado ainda — o CRUD já permite fazer isso
   pelo painel assim que houver uma conta admin logada.
7. **Base de veículos (marcas/modelos/versões) para compatibilidade** —
   **lotes 1, 2, 3 e 4 aplicados**: 32 marcas, 252 modelos, 440 versões em
   `marcas_veiculo`/`modelos_veiculo`/`versoes_veiculo`. Lote 1
   (`data/vehicles-seed/lote1.json`): linha de entrada (Gol, Uno, Onix,
   HB20 etc.) das mesmas 14 marcas, Nissan/Mitsubishi/Kia/Jeep parciais.
   Lote 2 (`data/vehicles-seed/lote2.json`): picapes compactas/médias,
   SUVs/crossovers e furgões de passeio dessas mesmas marcas (Amarok,
   Tiguan, Territory, Maverick, RAV4, Santa Fe, Koleos, Trailblazer etc.) —
   nenhuma marca nova, só modelos novos. Corrigiu também uma entrada
   genérica do Peugeot Partner do lote 1 (via `UPDATE`, não duplicou).
   Lote 3 (`data/vehicles-seed/lote3.json`): substituiu as entradas
   genéricas de Nissan/Mitsubishi/Kia/Jeep do lote 1 por detalhamento
   completo por geração (March, Versa, Kicks, Sentra, Frontier, L200/
   Triton, Pajero, ASX, Sportage, Sorento, Renegade, Compass, Commander,
   Wrangler etc.) e acrescentou 11 marcas novas de segundo/terceiro
   escalão: Suzuki, Chery, JAC, BYD, GWM, Land Rover, Mercedes-Benz, BMW,
   Audi, Subaru, Volvo. As `versoes_veiculo` genéricas dessas 4 marcas do
   lote 1 foram apagadas antes (0 linhas remanescentes confirmado via SQL)
   para dar lugar às entradas detalhadas do lote 3.
   Lote 4 (`data/vehicles-seed/lote4.json`): clássicos nacionais pré-1990
   detalhados por fase/motorização em marcas já existentes (VW Fusca/
   Kombi/Brasília/Variant/TL/SP2/Karmann-Ghia, Chevrolet Opala/Veraneio/
   Série 10/Série 20, Ford F-1000/F-4000/Maverick/Galaxie-Landau, Toyota
   Bandeirante) e 7 marcas extintas/nicho novas (DKW-Vemag, Willys-
   Overland, Simca do Brasil, Puma, Gurgel) além de RAM (Rampage nacional
   e 1500/2500/3500) e Dodge/Chrysler histórico BR (Dart, Charger R/T, Le
   Baron/Magnum, Dodge 1800/Polara "Dodginho", Journey). Excluído por não
   ter existido no mercado brasileiro: "Dodge 3000".
   Schema não precisou de migration nova (`versoes_veiculo.familia` já
   existia para a sugestão automática por plataforma da seção 2.1.1 do
   `PLANEJAMENTO.md`).
   **Próximo**: sem lote 5 definido ainda pelo cliente. Fluxo pra aplicar um
   lote novo:
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

## Bug crítico corrigido: embeds do PostgREST tratados como array

Todo o código que lê relações aninhadas via `.select("... campo:tabela ( ... )")`
(em `src/lib/queries.ts` e `src/lib/admin-queries.ts`) tinha sido escrito
assumindo que o Supabase sempre devolve embeds como array (`row.campo?.[0]`).
**Isso está errado**: para relação para-um (FK na própria tabela consultada —
`brand_id`, `category_id`, `modelo_id`, `marca_id`, `customer_id` etc.), o
PostgREST devolve um **objeto** (ou `null`), nunca um array. Só relação
para-muitos vira array de verdade. O comentário antigo no código ("Untyped
PostgREST client infers to-one embeds as arrays") estava incorreto — isso é
inferência de _tipo_ do TypeScript sem o client tipado (`createClient<Database>`
ainda não usado), não o formato real do JSON.

Esse bug ficou invisível a sessão inteira porque `versoes_veiculo` estava
vazia até os lotes 1/2 — só apareceu quando a base de compatibilidade
passou a ter dado de verdade (o select de Marca/Modelo do veículo no
formulário de produto renderizava vazio). Foi corrigido em todos os pontos
(brand, category, customer, versao→modelo→marca em pedidos/produtos/
compatibilidade). Se adicionar um novo `.select()` com embed, lembrar:
**objeto para relação para-um, array só para para-muitos** — não assumir
array por padrão.

## Nota importante sobre o ambiente

O sandbox onde este trabalho foi feito tem uma política de rede que **bloqueia
acesso direto ao host do Supabase** a partir de processos comuns (dev server,
`curl`) — só as ferramentas MCP do Supabase conseguem falar com o projeto.
Por isso não foi possível abrir o app rodando com dado real e mostrar
visualmente nesta sessão (só consegui mostrar a tela de login, que não
depende de fetch). Isso é uma característica _deste ambiente específico_, não
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
