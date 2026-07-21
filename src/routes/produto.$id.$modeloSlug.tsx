import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProductBySlugAndVehicle, getRelatedProducts, getStoreSettings } from "@/lib/queries";
import {
  ProductDetailPage,
  ProductNotFound,
  buildProductHead,
} from "@/components/product-detail-page";

export const Route = createFileRoute("/produto/$id/$modeloSlug")({
  loader: async ({ params }) => {
    const product = await getProductBySlugAndVehicle({
      data: { slug: params.id, modeloSlug: params.modeloSlug },
    });
    if (!product) throw notFound();
    const [related, storeSettings] = await Promise.all([
      product.category
        ? getRelatedProducts({ data: { categoryId: product.category.id, excludeId: product.id } })
        : Promise.resolve([]),
      getStoreSettings(),
    ]);
    return { product, related, storeSettings };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    return buildProductHead(loaderData.product, params.modeloSlug);
  },
  component: RouteComponent,
  notFoundComponent: ProductNotFound,
});

function RouteComponent() {
  const { product, related, storeSettings } = Route.useLoaderData();
  return <ProductDetailPage product={product} related={related} storeSettings={storeSettings} />;
}
