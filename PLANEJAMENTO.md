# Zankar Auto Parts — Plano de Arquitetura e Desenvolvimento (Produção)

**Documento para apresentação ao cliente antes do início da codificação**
Data: 2026-07-21

---

## 0. Sumário Executivo

O protótipo `autopecateste` validou visualmente a marca Zankar Auto Parts e a UX do catálogo, carrinho e admin. Este documento define como transformar esse protótipo em um **produto de produção real**: com banco de dados, autenticação de verdade, pedidos persistidos, SEO indexável e um painel administrativo funcional — mantendo o design aprovado.

Regra de negócio fixa do cliente: **catálogo 100% público/anônimo e indexável**; **contas de cliente só são criadas pelo lojista** (sem autocadastro); dois fluxos de pedido coexistem — anônimo via WhatsApp (agora persistido) e cliente logado com experiência diferenciada.

---

## 1. Stack Tecnológica Recomendada

### 1.1 Decisão: manter a base, evoluir a infraestrutura

| Camada                | Escolha                                                                                                                                                    | Justificativa                                                                                                                                                                                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework             | **TanStack Start 1.x + React 19 + Vite + TypeScript strict**                                                                                               | Já validado em produção no protótipo irmão (deploy Vercel funcionando). Trocar de framework agora custaria tempo sem ganho — o problema do protótipo é ausência de backend, não o framework.                                                                                                                           |
| Estilo                | **Tailwind CSS v4 + shadcn/radix ("new-york")**                                                                                                            | Design system já aprovado pelo cliente; portar 1:1.                                                                                                                                                                                                                                                                    |
| Banco de dados        | **Postgres via Supabase**                                                                                                                                  | Já há integração Supabase disponível no ambiente. Postgres relacional é o correto para catálogo normalizado + pedidos transacionais (estoque precisa de integridade real). Supabase entrega Postgres + Auth + Storage + RLS nativamente, reduzindo peças móveis.                                                       |
| ORM/Query layer       | **Drizzle ORM** sobre o Postgres do Supabase                                                                                                               | Type-safe, migrations declarativas versionadas em código, leve, não conflita com Supabase Auth/RLS (Drizzle apenas fala SQL — as políticas RLS continuam sendo a fonte de verdade de segurança, não a ORM). Alternativa avaliada: Prisma — mais pesado, cold start pior em serverless; Drizzle é preferível na Vercel. |
| Autenticação          | **Supabase Auth** (e-mail/senha + magic-link opcional para admin)                                                                                          | Cobre os dois perfis (cliente e lojista) com RLS nativo via `auth.uid()`, sem reinventar sessão/JWT.                                                                                                                                                                                                                   |
| Hosting               | **Vercel** (já validado)                                                                                                                                   | Nitro plugin + preset "vercel" já comprovados no protótipo. Documentar armadilhas abaixo.                                                                                                                                                                                                                              |
| Storage de imagens    | **Supabase Storage** (bucket público para fotos de produto, bucket privado para documentos fiscais futuros) com transformação/otimização de imagem via CDN | Evita depender de serviço externo adicional; já integrado ao mesmo projeto Supabase.                                                                                                                                                                                                                                   |
| Cache                 | **Vercel Edge Cache** em rotas de catálogo + **Vercel KV (Redis)** para contadores/rate limiting                                                           | Catálogo é público e muda pouco → cache agressivo em edge. Dados de pedido/conta nunca cacheados.                                                                                                                                                                                                                      |
| Filas/background jobs | **Vercel Cron Functions** (sitemap, expiração de carrinhos, relatórios) — sem fila dedicada no MVP                                                         | Evita complexidade prematura; caminho de upgrade documentado (Inngest ou Supabase Edge Functions + `pg_cron`).                                                                                                                                                                                                         |
| E-mail transacional   | **Resend** (ou Supabase SMTP)                                                                                                                              | Necessário pois login de cliente não é autocadastro — precisa de canal para entregar credenciais/convites.                                                                                                                                                                                                             |
| Observability/erros   | **Sentry** (frontend + server), complementando o wrapper customizado `src/server.ts`                                                                       | O wrapper atual só produz página de erro decente; não há captura/alerta.                                                                                                                                                                                                                                               |
| Package manager       | **bun** (mantido)                                                                                                                                          | Já validado no protótipo.                                                                                                                                                                                                                                                                                              |

### 1.2 Pontos frágeis do deploy Vercel+Nitro descobertos no protótipo (replicar com cuidado)

1. **`nitro` precisa estar em `dependencies`, não `devDependencies`**.
2. **Plugin `nitro()` do pacote `nitro/vite` deve ser adicionado explicitamente** no `vite.config.ts`, depois do `tanstackStart()` — senão o output SSR não vira o formato serverless do Vercel.
3. O preset `"vercel"` só ativa com a env var `VERCEL` setada — automático na Vercel, mas quebra silenciosamente em simulações locais. Documentar no README.
4. Sem `vercel.json` explícito — depende de auto-detecção do framework preset. Adicionar smoke test de `vercel build` na CI antes de cada deploy.
5. `src/server.ts` (wrapper de erro 500 do h3) deve ser portado e mantido coexistindo com Sentry.

### 1.3 Preparação para multi-tenant futuro

Mesmo sendo single-tenant no MVP, todo o schema inclui `tenant_id` em todas as tabelas de negócio, e as políticas RLS já são parametrizadas por tenant — evita migração dolorosa depois.

---

## 2. Modelo de Dados

Todas as tabelas: `id uuid default gen_random_uuid()`, `tenant_id uuid not null`, `created_at`/`updated_at timestamptz`, `deleted_at timestamptz null` (soft delete).

### 2.1 Catálogo

```
tenants (id, name, slug, created_at)

brands (id, tenant_id, name, slug, logo_url)

categories (id, tenant_id, parent_id -> self, name, slug, icon, sort_order)

products (
  id, tenant_id, sku, name, slug,
  brand_id -> brands, category_id -> categories,
  description, description_short,
  cost_price (admin-only), price, compare_at_price,
  stock_quantity, low_stock_threshold,
  weight_kg, height_cm, width_cm, length_cm,
  ncm, status enum(draft/active/archived),
  featured, view_count, search_vector tsvector
)

product_images (id, product_id, storage_path, alt_text, sort_order, is_primary)

-- Compatibilidade de veículo normalizada (ver seção 2.1.1 para o desenho completo)
-- "marcas/modelos/versoes" aqui são do VEÍCULO (Volkswagen, Gol, Gol G5 2008-2012),
-- distinto de "brands" acima, que é o fabricante da PEÇA (Bosch, NGK, Fras-le).
marcas_veiculo (id, tenant_id, nome, slug)
modelos_veiculo (id, marca_id -> marcas_veiculo, nome, slug)
versoes_veiculo (id, modelo_id -> modelos_veiculo, nome, ano_inicio, ano_fim, motorizacao, combustivel)
produto_compatibilidade (id, produto_id -> products, versao_id -> versoes_veiculo)
```

### 2.1.1 Compatibilidade de veículo — desenho detalhado (peça central do sistema)

Esta é a parte mais valiosa e mais delicada do produto: o que faz o cliente achar "essa peça serve no meu carro" com confiança. Segue o desenho completo (baseado em definição direta do cliente).

**Modelo relacional em cascata:** `marcas_veiculo` → `modelos_veiculo` → `versoes_veiculo` → `produto_compatibilidade`. Uma peça nunca se relaciona direto com marca/modelo — sempre com uma **versão** específica (que já carrega o intervalo de ano e, quando relevante, motorização/combustível). Isso evita o erro comum de "essa peça serve no Gol" sem dizer qual geração.

Exemplo de dado real:

```
Farol dianteiro (produto_id=15) é compatível com:
  ✓ Gol G5 (2008–2012)   → versao_id=8
  ✓ Voyage G5 (2009–2012) → versao_id=9
  ✓ Saveiro G5 (2010–2013) → versao_id=12

produto_compatibilidade:
  (produto_id=15, versao_id=8)
  (produto_id=15, versao_id=9)
  (produto_id=15, versao_id=12)
```

**Fluxo no painel admin (cadastro/edição de peça):**

1. Campo "Compatibilidade" com busca/autocomplete: o lojista digita `"Gol"` e o sistema sugere as versões cadastradas (`Gol G4 2005-2008`, `Gol G5 2008-2012`, `Gol G6 2013-2016`, ...).
2. Seleção via checkboxes — pode marcar várias versões de uma vez, de modelos diferentes.
3. **Sugestão automática por proximidade**: ao marcar uma versão (ex: `Gol G5 2008–2012`), o sistema propõe candidatos prováveis da mesma plataforma/geração (ex: `Voyage G5`, `Saveiro G5`) como checkboxes não marcados ("Talvez esta peça também sirva em:") — reduz drasticamente o trabalho de cadastro repetitivo. Implementação: agrupar `versoes_veiculo` por uma tag de plataforma/geração compartilhada (campo `plataforma` ou tabela de agrupamento `familia_veiculo`, a definir na Fase de schema) e sugerir versões da mesma família com faixa de ano sobreposta.
4. **Cadastro manual sempre disponível** (`+ Novo veículo`), independente de quão completa esteja a base pré-carregada — campos: Marca, Modelo, Versão, Ano inicial, Ano final, Motorização (opcional). Necessário porque sempre existem: carros novos, versões especiais, peças importadas, veículos antigos, ou erro na base pronta.
5. **Busca no catálogo público (lado cliente)**: filtro "Meu veículo" com os mesmos três selects em cascata (marca → modelo → versão) reaproveitando as mesmas tabelas — o cliente encontra peças filtrando por veículo, não só por categoria/texto.

**Origem dos dados:**

- `marcas_veiculo`/`modelos_veiculo`/`versoes_veiculo` (a "árvore" de veículos) podem ser **pré-carregados via seed** a partir de fontes públicas: Tabela FIPE, bases do Denatran, APIs gratuitas de veículos, ou listas prontas (GitHub). Isso é trabalho de importação único (script de seed), não desenvolvimento de feature.
- `produto_compatibilidade` (qual peça serve em qual veículo) **não existe em nenhuma base pública** — é conhecimento proprietário da autopeças e precisa ser cadastrado manualmente pelo lojista, tela por tela. É exatamente por isso que os itens 2 (checkboxes rápidos) e 3 (sugestão automática) acima são prioridade de UX, não luxo.

### 2.2 Pedidos e clientes

```
customers (
  id, tenant_id, auth_user_id -> auth.users (nullable até ativação),
  name, email, phone, document,
  customer_type enum(anonymous_history/account),
  price_tier_id -> price_tiers (nullable),
  invited_at, activated_at, invite_token_hash, invite_expires_at,
  status enum(invited/active/disabled)
)

price_tiers (id, tenant_id, name, discount_percent)

addresses (id, customer_id nullable, tenant_id, label, recipient_name, phone, cep, street, number, complement, district, city, state, is_default)

orders (
  id, tenant_id, order_number,
  customer_id -> customers (nullable = pedido anônimo),
  guest_name, guest_phone, guest_email,
  status enum(pending_whatsapp/confirmed/processing/shipped/delivered/cancelled),
  channel enum(whatsapp_guest/account_checkout),
  shipping_address_id, subtotal, shipping_cost, discount_total, total,
  notes, whatsapp_message_sent_at, whatsapp_thread_ref
)

order_items (id, order_id, product_id, product_name_snapshot, product_sku_snapshot, unit_price_snapshot, quantity, line_total)

order_status_history (id, order_id, status, changed_by, changed_at, note)
```

### 2.3 Configuração e admin

```
store_settings (id, tenant_id unique, legal_name, cnpj, phone_whatsapp, address, business_hours jsonb, social_links jsonb)

admin_users (id, tenant_id, auth_user_id -> auth.users, role enum(owner/staff), name, email, status)

audit_log (id, tenant_id, admin_user_id, action, entity_type, entity_id, diff jsonb, created_at)
```

### 2.4 Carrinho

Carrinho continua **client-side (localStorage)** para o visitante anônimo. Ao fechar o pedido (anônimo ou logado), é validado contra o banco (preço/estoque atuais) e materializado como `orders`+`order_items` antes de qualquer redirecionamento ao WhatsApp. Cliente logado pode ganhar `cart_items` persistido entre dispositivos — fase 4, não MVP.

---

## 3. Row Level Security (RLS)

RLS **habilitado em todas as tabelas**, sempre — público por política explícita, nunca por ausência de política.

### Papéis

- `anon` — visitante não autenticado
- `authenticated` + `customers.auth_user_id = auth.uid()` — cliente logado
- `authenticated` + `admin_users.auth_user_id = auth.uid()` — lojista/funcionário (via função `is_admin(auth.uid())`)

### Público (leitura anônima)

`products`, `product_images`, `categories`, `brands`, `marcas_veiculo/modelos_veiculo/versoes_veiculo`, `produto_compatibilidade`, `store_settings` (campos públicos). `SELECT` liberado onde `status='active'` e `deleted_at is null`. Escrita bloqueada para todos exceto admin.

### Autenticado (cliente logado)

`orders`, `order_items`, `addresses`, `customers` (linha própria), `cart_items`. `SELECT/INSERT/UPDATE` restrito a `customer_id = (select id from customers where auth_user_id = auth.uid())`. Cliente nunca altera `status` de pedido nem `price_tier_id` diretamente.

### Pedido anônimo (guest)

`INSERT` em `orders`/`order_items` com `customer_id null` **somente via RPC `create_guest_order(...)` `SECURITY DEFINER`**, com validação server-side de preço/estoque — nunca insert direto pela tabela, pra impedir forjar total/preço no client.

### Admin-only

`admin_users`, `audit_log`, coluna `cost_price` (view pública sem essa coluna), `store_settings` (write), `price_tiers`, toda escrita em `products/categories/brands/marcas_veiculo/modelos_veiculo/versoes_veiculo`. `ALL` permitido só quando `is_admin(auth.uid())` e `tenant_id` correspondente.

### Resumo de permissões

| Ação                     | Anônimo         | Cliente logado     | Lojista/admin         |
| ------------------------ | --------------- | ------------------ | --------------------- |
| Ver catálogo             | Sim             | Sim                | Sim                   |
| Criar pedido             | Sim (RPC guest) | Sim (vinculado)    | Sim (manual/balcão)   |
| Ver histórico de pedidos | Não             | Só os seus         | Todos                 |
| Ver preço diferenciado   | Não             | Sim, se tiver tier | N/A (vê custo também) |
| CRUD produtos/categorias | Não             | Não                | Sim                   |
| Criar conta de cliente   | N/A             | N/A                | Sim (único fluxo)     |

---

## 4. Autenticação e Multi-usuário

**4.1 Catálogo — 100% anônimo.** Nenhuma rota exige sessão; SSR serve HTML completo sem esperar auth.

**4.2 Pedido anônimo via WhatsApp (evoluído):** carrinho local → "Finalizar via WhatsApp" → RPC `create_guest_order` (valida estoque/preço, grava order+items, gera `order_number`) → mensagem WhatsApp inclui número do pedido → abre `wa.me` usando `store_settings.phone_whatsapp` (fonte única) → `status='pending_whatsapp'` até confirmação manual do lojista.

**4.3 Login de cliente cadastrado (não é autocadastro):**

1. Lojista cadastra o cliente no admin (nome, e-mail, telefone, tier opcional).
2. Sistema gera `invite_token` (hash, expira em 72h), envia e-mail via Resend com link de ativação.
3. Cliente define a própria senha na ativação (lojista nunca sabe a senha do cliente) → cria `auth.users` e vincula `customers.auth_user_id`.
4. Reenvio de convite disponível no admin.
5. Login normal depois (Supabase Auth), com "esqueci minha senha" padrão.

**4.4 Login de admin/lojista real:** substitui credenciais hardcoded. `admin_users` vinculado a `auth.users`, criado via seed para o `owner`. Proteção de rota real no **servidor** (loader `beforeLoad`), não só esconder botão no client.

**4.5 Níveis de permissão:** `owner` (acesso total) vs. `staff` (futuro — produtos/pedidos, sem financeiro/gestão de admins).

**4.6 Sessão:** Supabase Auth com cookies httpOnly via `@supabase/ssr`, refresh automático, `Secure`/`SameSite=Lax`.

---

## 5. SEO

- SSR real (herdado do TanStack Start).
- Meta tags dinâmicas por produto/categoria (title, description, og:image usando foto real).
- `sitemap.xml` gerado dinamicamente a partir de produtos/categorias ativos.
- `robots.txt` liberando catálogo, bloqueando `/admin`, `/conta`, `/api`.
- Structured data: `Product`+`Offer`, `BreadcrumbList`, `Organization`/`LocalBusiness` com dados reais.
- URLs amigáveis: `/produto/{slug}`, `/catalogo/{categoria-slug}`.
- Core Web Vitals: imagens reais otimizadas, `font-display: swap`, evitar CLS.
- Metas: LCP < 2.5s, CLS < 0.1, INP < 200ms (mobile 4G simulado).

---

## 6. Infraestrutura e Operação

- **Ambientes:** development (local), preview (Vercel PR + Supabase branch), production. Migrations Drizzle versionadas, aplicadas via CI.
- **Secrets:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `RESEND_API_KEY`, `SENTRY_DSN`, `WHATSAPP_DEFAULT_NUMBER` — via Vercel Env Vars, nunca commitado.
- **Cache:** catálogo com cache agressivo em edge; conta/pedido sempre `no-store`. Redis para rate limiting e views.
- **Rate limiting:** login (5 tentativas/15min por IP+e-mail), criação de pedido guest limitada por IP.
- **CORS:** não necessário (mesmo domínio, server functions).
- **Backups:** automáticos diários (Supabase), PITR se orçamento permitir.
- **Monitoramento:** Sentry (front+server), Vercel Analytics/Logs, alerta em erro 500 recorrente.

---

## 7. Requisitos Funcionais

- **Catálogo público:** busca full-text, filtros (categoria/marca/veículo/preço), paginação server-side, galeria real, compatibilidade estruturada, indicação de estoque.
- **Carrinho:** local, validado no checkout.
- **Pedido anônimo:** número real, persistido, WhatsApp com telefone centralizado.
- **Conta de cliente:** ativação por convite, login, histórico próprio, endereços salvos, preço diferenciado.
- **Admin produtos:** CRUD real, upload real de imagem, estoque com histórico, compatibilidade estruturada.
- **Admin categorias/marcas:** CRUD real, contagem calculada.
- **Admin pedidos:** fila real, status com histórico, filtro/busca.
- **Admin clientes:** CRUD de contas com convite, atribuição de tier.
- **Admin configurações:** dados reais, fonte única consumida pelo site público.
- **Admin dashboard:** métricas reais (pedidos/período, mais vendidos, ticket médio).

---

## 8. Requisitos Não-Funcionais

- **Segurança:** hashing via Supabase Auth, proteção de rota admin no servidor, RLS como defesa final, anti-enumeração de e-mail, validação Zod em toda entrada, HTTPS, CSRF mitigado via cookies SameSite.
- **Performance:** metas da seção 5; índices em `slug`, `category_id`, `search_vector` (GIN), `product_compatibility`.
- **Acessibilidade:** contraste validado, foco de teclado, alt text obrigatório, labels associados.
- **Escalabilidade:** schema multi-tenant-ready, cache em edge, sem bloqueios arquiteturais para novos tenants.
- **Observabilidade:** Sentry + logs estruturados em criação de pedido/login/checkout.

---

## 9. Fases e Sprints

1. **Fundação** — Supabase provisionado, schema completo via Drizzle, RLS em tudo, deploy Vercel replicando config Nitro, login admin real, CI com lint/typecheck/build smoke. _Risco: descompasso Vercel+Nitro (mitigado pelo checklist 1.2)._
2. **Catálogo público real** — `/catalogo` e `/produto/$slug` com Postgres real, busca/filtros server-side, imagens reais, SEO básico. _Depende da Fase 1._
3. **Carrinho e pedido persistido (anônimo)** — checkout validado contra estoque real, RPC `create_guest_order`, número de pedido, WhatsApp correto, pedido visível na fila do admin. _Depende da Fase 2._
4. **Conta de cliente** — convite por e-mail, ativação, login, histórico, endereço salvo, checkout rápido. _Depende da Fase 3 + Resend configurado. Risco: deliverability de e-mail (SPF/DKIM) — validar cedo._
5. **Admin CRUD completo** — produtos/categorias/marcas com upload real, pedidos com status/histórico, clientes, configurações persistidas, dashboard real. _Depende das Fases 2–4._
6. **SEO, performance e polish** — structured data completo, Core Web Vitals na meta, ajuste do logo (pendente, avisado pelo cliente), acessibilidade, hardening de rate limit/observabilidade, teste de carga leve no checkout. _Depende de todas as anteriores._

---

## 10. Reaproveitamento do Design

Portar como está, sem redesenho: paleta exata (`#1F1F1F`, `#FFFFFF`, `#6C2BD9`, `#4B1E78`, `#8A8ABA` via `color-mix()`), tipografia Montserrat, gradientes utilitários, componente `BrandMark`/`CarSilhouette`, shadcn/radix "new-york" + lucide.

**Único ajuste pendente antes de produção:** atualização do logo (já avisado pelo cliente), aplicado no `BrandMark` e assets de favicon/OG na Fase 6, sem impacto no resto do token system.

---

## Anexo — Gambiarras do protótipo → resolução em produção

| Gambiarra no protótipo                       | Resolução em produção                                                                                                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login hardcoded no client                    | Supabase Auth + proteção de rota no servidor                                                                                                                                                    |
| Checkout = WhatsApp manual sem persistência  | Pedido persistido via RPC antes do redirecionamento                                                                                                                                             |
| CRUD sem handler                             | CRUD real com RLS + Storage                                                                                                                                                                     |
| Telefone WhatsApp hardcoded em 4 lugares     | `store_settings.phone_whatsapp`, fonte única                                                                                                                                                    |
| Compatibilidade de veículo como string livre | `marcas_veiculo/modelos_veiculo/versoes_veiculo` + `produto_compatibilidade`, com autocomplete, sugestão automática por família de plataforma e cadastro manual sempre disponível (seção 2.1.1) |
| Categoria duplicada no Product               | `category_id` único (FK)                                                                                                                                                                        |
| Preço congelado silenciosamente no carrinho  | Validação no checkout + snapshot auditável                                                                                                                                                      |
| Pedidos/clientes do admin inventados         | Dados reais de `orders`/`customers`                                                                                                                                                             |
| Imagens = gradiente CSS                      | Imagens reais via Supabase Storage                                                                                                                                                              |
| Views/analytics fake                         | `view_count` real                                                                                                                                                                               |
| Sem paginação real                           | Paginação server-side                                                                                                                                                                           |
| Sem multi-tenant                             | `tenant_id` em todo o schema, single-tenant hoje                                                                                                                                                |
