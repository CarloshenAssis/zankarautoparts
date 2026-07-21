import { createFileRoute } from "@tanstack/react-router";
import { getBrands, getCategories, getVehicleMarcas } from "@/lib/queries";
import { getVehicleVersions } from "@/lib/admin-queries";
import { ProductForm } from "@/components/admin/product-form";

export const Route = createFileRoute("/admin/produtos/novo")({
  loader: async () => {
    const [marcasVeiculo, brands, categories, allVersions] = await Promise.all([
      getVehicleMarcas(),
      getBrands(),
      getCategories(),
      getVehicleVersions(),
    ]);
    return { marcasVeiculo, brands, categories, allVersions };
  },
  component: NovoProdutoPage,
});

function NovoProdutoPage() {
  const { marcasVeiculo, brands, categories, allVersions } = Route.useLoaderData();
  return (
    <ProductForm
      mode="create"
      marcasVeiculo={marcasVeiculo}
      brands={brands}
      categories={categories}
      allVersions={allVersions}
    />
  );
}
