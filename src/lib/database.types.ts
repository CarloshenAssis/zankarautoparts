// Auto-generated from the Supabase schema. Regenerate after every migration:
// mcp__Supabase__generate_typescript_types (or `supabase gen types typescript`).
// Not yet wired into createClient<Database>() — queries.ts uses a hand-written
// ProductRow shape for now; switching to this file is a Fase 5 cleanup.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          cep: string | null;
          city: string | null;
          complement: string | null;
          created_at: string;
          customer_id: string | null;
          district: string | null;
          id: string;
          is_default: boolean;
          label: string | null;
          number: string | null;
          phone: string | null;
          recipient_name: string | null;
          state: string | null;
          street: string | null;
          tenant_id: string;
          updated_at: string;
        };
      };
      admin_users: {
        Row: {
          auth_user_id: string | null;
          created_at: string;
          email: string;
          id: string;
          name: string;
          role: string;
          status: string;
          tenant_id: string;
          updated_at: string;
        };
      };
      audit_log: {
        Row: {
          action: string;
          admin_user_id: string | null;
          created_at: string;
          diff: Json | null;
          entity_id: string | null;
          entity_type: string;
          id: string;
          tenant_id: string;
        };
      };
      brands: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          slug: string;
          tenant_id: string;
          updated_at: string;
        };
      };
      categories: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          icon: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
          tenant_id: string;
          updated_at: string;
        };
      };
      customers: {
        Row: {
          activated_at: string | null;
          auth_user_id: string | null;
          created_at: string;
          customer_type: string;
          deleted_at: string | null;
          document: string | null;
          email: string | null;
          id: string;
          invite_expires_at: string | null;
          invite_token_hash: string | null;
          invited_at: string | null;
          name: string;
          phone: string | null;
          price_tier_id: string | null;
          status: string;
          tenant_id: string;
          updated_at: string;
        };
      };
      marcas_veiculo: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          nome: string;
          slug: string;
          tenant_id: string;
          updated_at: string;
        };
      };
      modelos_veiculo: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          marca_id: string;
          nome: string;
          slug: string;
          updated_at: string;
        };
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          line_total: number;
          order_id: string;
          product_id: string | null;
          product_name_snapshot: string;
          product_sku_snapshot: string;
          quantity: number;
          unit_price_snapshot: number;
        };
      };
      order_status_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: string;
          note: string | null;
          order_id: string;
          status: string;
        };
      };
      orders: {
        Row: {
          channel: string;
          created_at: string;
          customer_id: string | null;
          discount_total: number;
          guest_email: string | null;
          guest_name: string | null;
          guest_phone: string | null;
          id: string;
          notes: string | null;
          order_number: string;
          shipping_address_id: string | null;
          shipping_cost: number;
          status: string;
          subtotal: number;
          tenant_id: string;
          total: number;
          updated_at: string;
          whatsapp_message_sent_at: string | null;
          whatsapp_thread_ref: string | null;
        };
      };
      price_tiers: {
        Row: {
          created_at: string;
          discount_percent: number;
          id: string;
          name: string;
          tenant_id: string;
          updated_at: string;
        };
      };
      product_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          id: string;
          is_primary: boolean;
          product_id: string;
          sort_order: number;
          storage_path: string;
        };
      };
      products: {
        Row: {
          brand_id: string | null;
          category_id: string | null;
          compare_at_price: number | null;
          cost_price: number | null;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          description_short: string | null;
          featured: boolean;
          height_cm: number | null;
          id: string;
          length_cm: number | null;
          low_stock_threshold: number;
          name: string;
          ncm: string | null;
          price: number;
          search_vector: unknown;
          sku: string;
          slug: string;
          status: string;
          stock_quantity: number;
          tenant_id: string;
          updated_at: string;
          view_count: number;
          weight_kg: number | null;
          width_cm: number | null;
        };
      };
      produto_compatibilidade: {
        Row: {
          created_at: string;
          id: string;
          produto_id: string;
          versao_id: string;
        };
      };
      store_settings: {
        Row: {
          address: Json | null;
          business_hours: Json | null;
          cnpj: string | null;
          created_at: string;
          email: string | null;
          id: string;
          legal_name: string | null;
          phone_whatsapp: string | null;
          social_links: Json | null;
          tenant_id: string;
          updated_at: string;
          website: string | null;
        };
      };
      tenants: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
      };
      versoes_veiculo: {
        Row: {
          ano_fim: number | null;
          ano_inicio: number;
          combustivel: string | null;
          created_at: string;
          deleted_at: string | null;
          familia: string | null;
          id: string;
          modelo_id: string;
          motorizacao: string | null;
          nome: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      create_guest_order: {
        Args: {
          p_guest_email?: string;
          p_guest_name: string;
          p_guest_phone: string;
          p_items: Json;
          p_notes?: string;
        };
        Returns: { order_id: string; order_number: string; total: number }[];
      };
      is_admin: { Args: { uid: string }; Returns: boolean };
    };
  };
};
