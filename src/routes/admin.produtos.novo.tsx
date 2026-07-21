import { createFileRoute } from "@tanstack/react-router";
import { getBrands, getCategories } from "@/lib/queries";
import { getVehicleVersions } from "@/lib/admin-queries";
import { ProductForm } from "@/components/admin/product-form";

export const Route = createFileRoute("/admin/produtos/novo")({
  loader: async () => {
    const [brands, categories, allVersions] = await Promise.all([
      getBrands(),
      getCategories(),
      getVehicleVersions(),
    ]);
    return { brands, categories, allVersions };
  },
  component: NovoProdutoPage,
});

function NovoProdutoPage() {
  const { brands, categories, allVersions } = Route.useLoaderData();
  return (
    <ProductForm mode="create" brands={brands} categories={categories} allVersions={allVersions} />
  );
}
