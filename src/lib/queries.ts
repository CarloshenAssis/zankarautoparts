import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, Product, StoreSettings } from "@/lib/types";

const PRODUCT_SELECT = `
  id, sku, name, slug, description, description_short,
  price, compare_at_price, stock_quantity, featured, view_count,
  marca_veiculo:marcas_veiculo ( id, nome, slug ),
  brand:brands ( id, name, slug ),
  category:categories ( id, name, slug ),
  images:product_images ( id, storage_path, alt_text, is_primary ),
  compatibility:produto_compatibilidade (
    versao_id, is_primary, ano_especifico,
    versao:versoes_veiculo (
      nome, ano_inicio, ano_fim,
      modelo:modelos_veiculo ( nome, marca:marcas_veiculo ( nome ) )
    )
  )
`;

type ProductRow = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  description_short: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  featured: boolean;
  view_count: number;
  marca_veiculo: Product["marca_veiculo"];
  brand: NonNullable<Product["brand"]> | null;
  category: NonNullable<Product["category"]> | null;
  images: Product["images"];
  compatibility: {
    versao_id: string;
    is_primary: boolean;
    ano_especifico: number | null;
    versao: {
      nome: string;
      ano_inicio: number;
      ano_fim: number | null;
      modelo: { nome: string; marca: { nome: string } | null } | null;
    } | null;
  }[];
};

function mapProductRow(row: ProductRow): Product {
  const compatibility = (row.compatibility ?? [])
    .map((c) => {
      const versao = c.versao;
      const modelo = versao?.modelo;
      const marca = modelo?.marca;
      return {
        versao_id: c.versao_id,
        versao_nome: versao?.nome ?? "",
        ano_inicio: versao?.ano_inicio ?? 0,
        ano_fim: versao?.ano_fim ?? null,
        modelo_nome: modelo?.nome ?? "",
        marca_nome: marca?.nome ?? "",
        is_primary: c.is_primary,
        ano_especifico: c.ano_especifico,
      };
    })
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    description: row.description,
    description_short: row.description_short,
    price: Number(row.price),
    compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : null,
    stock_quantity: row.stock_quantity,
    featured: row.featured,
    view_count: row.view_count,
    marca_veiculo: row.marca_veiculo ?? null,
    brand: row.brand ?? null,
    category: row.category ?? null,
    images: row.images ?? [],
    compatibility,
    compatibilityModel: compatibility.length <= 4 ? "1" : "2",
  };
}

export const getStoreSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<StoreSettings | null> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("store_settings").select("*").maybeSingle();
    if (error) throw error;
    return data as StoreSettings | null;
  },
);

export const getCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => {
    const supabase = createSupabaseServerClient();
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, slug, icon, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;

    const withCounts = await Promise.all(
      (categories ?? []).map(async (c) => {
        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("category_id", c.id)
          .eq("status", "active");
        return { ...c, product_count: count ?? 0 };
      }),
    );

    return withCounts;
  },
);

export const getBrands = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("brands").select("id, name, slug").order("name");
  if (error) throw error;
  return data ?? [];
});

export const getVehicleMarcas = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("marcas_veiculo")
    .select("id, nome, slug")
    .is("deleted_at", null)
    .order("nome");
  if (error) throw error;
  return data ?? [];
});

export const getFeaturedProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .eq("featured", true)
      .limit(8);
    if (error) throw error;
    return ((data ?? []) as unknown as ProductRow[]).map(mapProductRow);
  },
);

export const getProducts = createServerFn({ method: "GET" })
  .validator((input: { q?: string; categorySlug?: string } | undefined) => input ?? {})
  .handler(async ({ data }): Promise<Product[]> => {
    const supabase = createSupabaseServerClient();
    let query = supabase.from("products").select(PRODUCT_SELECT).eq("status", "active");

    if (data.categorySlug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", data.categorySlug)
        .maybeSingle();
      if (cat) query = query.eq("category_id", cat.id);
    }
    if (data.q) {
      query = query.textSearch("search_vector", data.q, {
        type: "websearch",
        config: "portuguese",
      });
    }

    const { data: rows, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return ((rows ?? []) as unknown as ProductRow[]).map(mapProductRow);
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<Product | null> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw error;
    return data ? mapProductRow(data as unknown as ProductRow) : null;
  });

export const getProductBySlugAndVehicle = createServerFn({ method: "GET" })
  .validator((input: { slug: string; modeloSlug: string }) => input)
  .handler(
    async ({
      data: { slug, modeloSlug },
    }): Promise<Product | null> => {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const product = mapProductRow(data as unknown as ProductRow);

      const modeloMatch = product.compatibility.find((c) => {
        const marcaSlug = c.marca_nome.toLowerCase().replace(/\s+/g, "-");
        const modeloSlugNorm = c.modelo_nome.toLowerCase().replace(/\s+/g, "-");
        const vehicleSlug = `${marcaSlug}-${modeloSlugNorm}`;
        return vehicleSlug === modeloSlug;
      });

      if (!modeloMatch) return null;

      return {
        ...product,
        compatibility: [modeloMatch],
      };
    },
  );

export const getRelatedProducts = createServerFn({ method: "GET" })
  .validator((input: { categoryId: string; excludeId: string }) => input)
  .handler(async ({ data }): Promise<Product[]> => {
    const supabase = createSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .eq("category_id", data.categoryId)
      .neq("id", data.excludeId)
      .limit(4);
    if (error) throw error;
    return ((rows ?? []) as unknown as ProductRow[]).map(mapProductRow);
  });
