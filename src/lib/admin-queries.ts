import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type AdminOrderItem = {
  id: string;
  product_name_snapshot: string;
  product_sku_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
};

export type AdminOrder = {
  id: string;
  order_number: string;
  status: string;
  channel: string;
  guest_name: string | null;
  guest_phone: string | null;
  total: number;
  notes: string | null;
  created_at: string;
  items: AdminOrderItem[];
  customer: { name: string; phone: string | null } | null;
};

export const getOrders = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminOrder[]> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
      id, order_number, status, channel, guest_name, guest_phone, total, notes, created_at,
      items:order_items ( id, product_name_snapshot, product_sku_snapshot, unit_price_snapshot, quantity, line_total ),
      customer:customers ( name, phone )
    `,
      )
      .order("created_at", { ascending: false });
    if (error) throw error;

    type OrderRow = Omit<AdminOrder, "total" | "customer"> & {
      total: number | string;
      customer: { name: string; phone: string | null } | null;
    };

    return ((data ?? []) as unknown as OrderRow[]).map((row) => ({
      id: row.id,
      order_number: row.order_number,
      status: row.status,
      channel: row.channel,
      guest_name: row.guest_name,
      guest_phone: row.guest_phone,
      total: Number(row.total),
      notes: row.notes,
      created_at: row.created_at,
      items: row.items ?? [],
      customer: row.customer ?? null,
    }));
  },
);

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator((input: { orderId: string; status: string; note?: string }) => input)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.orderId);
    if (updateError) throw updateError;

    const { error: historyError } = await supabase
      .from("order_status_history")
      .insert({ order_id: data.orderId, status: data.status, note: data.note ?? null });
    if (historyError) throw historyError;

    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Configurações da loja
// ---------------------------------------------------------------------------

export const updateStoreSettings = createServerFn({ method: "POST" })
  .validator(
    (input: {
      legalName: string;
      cnpj: string;
      phoneWhatsapp: string;
      email: string;
      website: string;
      street: string;
      district: string;
      city: string;
      state: string;
      weekdays: string;
      saturday: string;
      notes: string;
      instagram: string;
      facebook: string;
      youtube: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("store_settings")
      .update({
        legal_name: data.legalName,
        cnpj: data.cnpj,
        phone_whatsapp: data.phoneWhatsapp,
        email: data.email,
        website: data.website,
        address: {
          street: data.street,
          district: data.district,
          city: data.city,
          state: data.state,
        },
        business_hours: { weekdays: data.weekdays, saturday: data.saturday, notes: data.notes },
        social_links: { instagram: data.instagram, facebook: data.facebook, youtube: data.youtube },
      })
      .eq("tenant_id", "00000000-0000-0000-0000-000000000001");
    if (error) throw error;
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------

export type AdminProduct = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  status: string;
  price: number;
  stock_quantity: number;
  featured: boolean;
  view_count: number;
  created_at: string;
  description: string | null;
  description_short: string | null;
  marca_veiculo: { id: string; nome: string } | null;
  brand: { id: string; name: string } | null;
  category: { id: string; name: string; slug: string } | null;
  images: { id: string; storage_path: string; is_primary: boolean }[];
  compatibility: {
    versao_id: string;
    label: string;
    is_primary: boolean;
    ano_especifico: number | null;
  }[];
};

const ADMIN_PRODUCT_SELECT = `
  id, sku, name, slug, status, price, stock_quantity, featured, view_count, created_at, description, description_short,
  marca_veiculo:marcas_veiculo ( id, nome ),
  brand:brands ( id, name ),
  category:categories ( id, name, slug ),
  images:product_images ( id, storage_path, is_primary ),
  compatibility:produto_compatibilidade (
    versao_id, is_primary, ano_especifico,
    versao:versoes_veiculo ( nome, ano_inicio, ano_fim, modelo:modelos_veiculo ( nome, marca:marcas_veiculo ( nome ) ) )
  )
`;

type AdminProductRow = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  status: string;
  price: number | string;
  stock_quantity: number;
  featured: boolean;
  view_count: number;
  created_at: string;
  description: string | null;
  description_short: string | null;
  marca_veiculo: { id: string; nome: string } | null;
  brand: { id: string; name: string } | null;
  category: { id: string; name: string; slug: string } | null;
  images: { id: string; storage_path: string; is_primary: boolean }[] | null;
  compatibility:
    | {
        versao_id: string;
        is_primary: boolean;
        ano_especifico: number | null;
        versao: {
          nome: string;
          ano_inicio: number;
          ano_fim: number | null;
          modelo: { nome: string; marca: { nome: string } | null } | null;
        } | null;
      }[]
    | null;
};

function mapAdminProduct(row: AdminProductRow): AdminProduct {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    status: row.status,
    price: Number(row.price),
    stock_quantity: row.stock_quantity,
    featured: row.featured,
    view_count: row.view_count,
    created_at: row.created_at,
    description: row.description,
    description_short: row.description_short,
    marca_veiculo: row.marca_veiculo ?? null,
    brand: row.brand ?? null,
    category: row.category ?? null,
    images: row.images ?? [],
    compatibility: (row.compatibility ?? [])
      .map((c) => {
        const versao = c.versao;
        const modelo = versao?.modelo;
        const marca = modelo?.marca;
        const label = versao
          ? `${marca?.nome ?? ""} ${modelo?.nome ?? ""} ${versao.nome} (${versao.ano_inicio}–${versao.ano_fim ?? "atual"})`
          : "";
        return {
          versao_id: c.versao_id,
          label: label.trim(),
          is_primary: c.is_primary,
          ano_especifico: c.ano_especifico,
        };
      })
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary)),
  };
}

export const getAdminProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminProduct[]> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(ADMIN_PRODUCT_SELECT)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as AdminProductRow[]).map(mapAdminProduct);
  },
);

export const getAdminProductById = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }): Promise<AdminProduct | null> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(ADMIN_PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapAdminProduct(data as unknown as AdminProductRow) : null;
  });

export type ProductInput = {
  name: string;
  sku: string;
  marcaVeiculoId: string | null;
  brandId: string | null;
  categoryId: string | null;
  price: number;
  stockQuantity: number;
  description: string;
  descriptionShort: string;
  status: "draft" | "active" | "archived";
  featured: boolean;
  compatibility: { versaoId: string; anoEspecifico: number | null }[];
  images: { storagePath: string; isPrimary: boolean }[];
};

export const createProduct = createServerFn({ method: "POST" })
  .validator((input: ProductInput) => input)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const slug = `${slugify(data.name)}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: data.name,
        sku: data.sku,
        slug,
        marca_veiculo_id: data.marcaVeiculoId,
        brand_id: data.brandId,
        category_id: data.categoryId,
        price: data.price,
        stock_quantity: data.stockQuantity,
        description: data.description || null,
        description_short: data.descriptionShort || null,
        status: data.status,
        featured: data.featured,
      })
      .select("id")
      .single();
    if (error) throw error;

    await syncProductRelations(supabase, product.id, data);
    return { id: product.id as string };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((input: { id: string } & ProductInput) => input)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("products")
      .update({
        name: data.name,
        sku: data.sku,
        marca_veiculo_id: data.marcaVeiculoId,
        brand_id: data.brandId,
        category_id: data.categoryId,
        price: data.price,
        stock_quantity: data.stockQuantity,
        description: data.description || null,
        description_short: data.descriptionShort || null,
        status: data.status,
        featured: data.featured,
      })
      .eq("id", data.id);
    if (error) throw error;

    await syncProductRelations(supabase, data.id, data);
    return { ok: true };
  });

async function syncProductRelations(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  productId: string,
  data: ProductInput,
) {
  await supabase.from("produto_compatibilidade").delete().eq("produto_id", productId);
  if (data.compatibility.length > 0) {
    await supabase.from("produto_compatibilidade").insert(
      data.compatibility.map((c, i) => ({
        produto_id: productId,
        versao_id: c.versaoId,
        is_primary: i === 0,
        ano_especifico: c.anoEspecifico,
      })),
    );
  }

  await supabase.from("product_images").delete().eq("product_id", productId);
  if (data.images.length > 0) {
    await supabase.from("product_images").insert(
      data.images.map((img, i) => ({
        product_id: productId,
        storage_path: img.storagePath,
        is_primary: img.isPrimary,
        sort_order: i,
      })),
    );
  }
}

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export const createCategory = createServerFn({ method: "POST" })
  .validator((input: { name: string; icon: string }) => input)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("categories")
      .insert({ name: data.name, slug: slugify(data.name), icon: data.icon || null });
    if (error) throw error;
    return { ok: true };
  });

export const updateCategory = createServerFn({ method: "POST" })
  .validator((input: { id: string; name: string; icon: string }) => input)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("categories")
      .update({ name: data.name, slug: slugify(data.name), icon: data.icon || null })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("categories")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Compatibilidade de veículo
// ---------------------------------------------------------------------------

export type VehicleVersion = {
  id: string;
  nome: string;
  ano_inicio: number;
  ano_fim: number | null;
  familia: string | null;
  modelo_nome: string;
  marca_nome: string;
};

export const getVehicleVersions = createServerFn({ method: "GET" }).handler(
  async (): Promise<VehicleVersion[]> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("versoes_veiculo")
      .select(
        "id, nome, ano_inicio, ano_fim, familia, modelo:modelos_veiculo ( nome, marca:marcas_veiculo ( nome ) )",
      )
      .is("deleted_at", null)
      .order("nome");
    if (error) throw error;

    type Row = {
      id: string;
      nome: string;
      ano_inicio: number;
      ano_fim: number | null;
      familia: string | null;
      modelo: { nome: string; marca: { nome: string } | null } | null;
    };

    return ((data ?? []) as unknown as Row[]).map((row) => {
      const modelo = row.modelo;
      const marca = modelo?.marca;
      return {
        id: row.id,
        nome: row.nome,
        ano_inicio: row.ano_inicio,
        ano_fim: row.ano_fim,
        familia: row.familia,
        modelo_nome: modelo?.nome ?? "",
        marca_nome: marca?.nome ?? "",
      };
    });
  },
);

export const createVehicleVersion = createServerFn({ method: "POST" })
  .validator(
    (input: {
      marcaNome: string;
      modeloNome: string;
      versaoNome: string;
      anoInicio: number;
      anoFim: number | null;
      familia?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();

    let { data: marca } = await supabase
      .from("marcas_veiculo")
      .select("id")
      .ilike("nome", data.marcaNome)
      .maybeSingle();
    if (!marca) {
      const { data: newMarca, error } = await supabase
        .from("marcas_veiculo")
        .insert({ nome: data.marcaNome, slug: slugify(data.marcaNome) })
        .select("id")
        .single();
      if (error) throw error;
      marca = newMarca;
    }

    let { data: modelo } = await supabase
      .from("modelos_veiculo")
      .select("id")
      .eq("marca_id", marca.id)
      .ilike("nome", data.modeloNome)
      .maybeSingle();
    if (!modelo) {
      const { data: newModelo, error } = await supabase
        .from("modelos_veiculo")
        .insert({ marca_id: marca.id, nome: data.modeloNome, slug: slugify(data.modeloNome) })
        .select("id")
        .single();
      if (error) throw error;
      modelo = newModelo;
    }

    const { data: versao, error: versaoError } = await supabase
      .from("versoes_veiculo")
      .insert({
        modelo_id: modelo.id,
        nome: data.versaoNome,
        ano_inicio: data.anoInicio,
        ano_fim: data.anoFim,
        familia: data.familia || null,
      })
      .select("id")
      .single();
    if (versaoError) throw versaoError;

    return {
      id: versao.id as string,
      label: `${data.marcaNome} ${data.modeloNome} ${data.versaoNome} (${data.anoInicio}–${data.anoFim ?? "atual"})`,
    };
  });

export const suggestRelatedVersions = createServerFn({ method: "GET" })
  .validator((versaoId: string) => versaoId)
  .handler(async ({ data: versaoId }): Promise<VehicleVersion[]> => {
    const supabase = createSupabaseServerClient();
    const { data: base } = await supabase
      .from("versoes_veiculo")
      .select("familia, ano_inicio, ano_fim")
      .eq("id", versaoId)
      .maybeSingle();
    if (!base?.familia) return [];

    const { data, error } = await supabase
      .from("versoes_veiculo")
      .select(
        "id, nome, ano_inicio, ano_fim, familia, modelo:modelos_veiculo ( nome, marca:marcas_veiculo ( nome ) )",
      )
      .eq("familia", base.familia)
      .neq("id", versaoId)
      .is("deleted_at", null);
    if (error) throw error;

    type Row = {
      id: string;
      nome: string;
      ano_inicio: number;
      ano_fim: number | null;
      familia: string | null;
      modelo: { nome: string; marca: { nome: string } | null } | null;
    };

    return ((data ?? []) as unknown as Row[]).map((row) => {
      const modelo = row.modelo;
      const marca = modelo?.marca;
      return {
        id: row.id,
        nome: row.nome,
        ano_inicio: row.ano_inicio,
        ano_fim: row.ano_fim,
        familia: row.familia,
        modelo_nome: modelo?.nome ?? "",
        marca_nome: marca?.nome ?? "",
      };
    });
  });

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

export type AdminCustomer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  status: string;
  created_at: string;
};

export const getCustomers = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminCustomer[]> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, email, phone, document, status, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
);

export const createCustomerAccount = createServerFn({ method: "POST" })
  .validator(
    (input: { name: string; email: string; phone: string; document: string; password: string }) =>
      input,
  )
  .handler(async ({ data }) => {
    const admin = await getCurrentAdmin();
    if (!admin) throw new Error("Apenas administradores podem criar contas de cliente.");

    const serviceClient = createSupabaseServiceClient();
    const { data: authUser, error: authError } = await serviceClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (authError) throw authError;

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("customers").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      document: data.document || null,
      auth_user_id: authUser.user.id,
      customer_type: "account",
      status: "active",
      activated_at: new Date().toISOString(),
    });
    if (error) {
      await serviceClient.auth.admin.deleteUser(authUser.user.id);
      throw error;
    }

    return { ok: true };
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("customers")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  });
