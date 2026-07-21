import { createFileRoute, notFound } from "@tanstack/react-router";
import { getBrands, getCategories } from "@/lib/queries";
import { getAdminProductById, getVehicleVersions } from "@/lib/admin-queries";
import { ProductForm } from "@/components/admin/product-form";

export const Route = createFileRoute("/admin/produtos/$id")({
  loader: async ({ params }) => {
    const [product, brands, categories, allVersions] = await Promise.all([
      getAdminProductById({ data: params.id }),
      getBrands(),
      getCategories(),
      getVehicleVersions(),
    ]);
    if (!product) throw notFound();
    return { product, brands, categories, allVersions };
  },
  component: EditarProdutoPage,
});

function EditarProdutoPage() {
  const { product, brands, categories, allVersions } = Route.useLoaderData();
  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      brands={brands}
      categories={categories}
      allVersions={allVersions}
      initial={{
        name: product.name,
        sku: product.sku,
        brandId: product.brand?.id ?? null,
        categoryId: product.category?.id ?? null,
        price: product.price,
        stockQuantity: product.stock_quantity,
        description: product.description ?? "",
        descriptionShort: product.description_short ?? "",
        status: product.status as "draft" | "active" | "archived",
        featured: product.featured,
        compatibility: product.compatibility.map((c) => ({ id: c.versao_id, label: c.label })),
        images: product.images.map((img) => ({
          storage_path: img.storage_path,
          is_primary: img.is_primary,
        })),
      }}
    />
  );
}
