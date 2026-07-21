export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  product_count: number;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
};

export type VehicleMarca = {
  id: string;
  nome: string;
  slug: string;
};

export type ProductImage = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  is_primary: boolean;
};

export type VehicleCompatibility = {
  versao_id: string;
  versao_nome: string;
  ano_inicio: number;
  ano_fim: number | null;
  modelo_nome: string;
  marca_nome: string;
};

export type Product = {
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
  marca_veiculo: VehicleMarca | null;
  brand: Pick<Brand, "id" | "name" | "slug"> | null;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  images: ProductImage[];
  compatibility: VehicleCompatibility[];
};

export type StoreSettings = {
  legal_name: string | null;
  cnpj: string | null;
  email: string | null;
  website: string | null;
  phone_whatsapp: string | null;
  address: {
    street?: string;
    district?: string;
    city?: string;
    state?: string;
  } | null;
  business_hours: {
    weekdays?: string;
    saturday?: string;
    notes?: string;
  } | null;
  social_links: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  } | null;
};

export function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
