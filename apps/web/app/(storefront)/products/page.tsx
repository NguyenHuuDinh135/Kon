import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { formatCategory } from "@/lib/product-images";

interface OlistProduct {
  product_id: string;
  product_category_name: string;
  product_photos_qty: number | null;
  product_weight_g: number | null;
}

export default async function ProductsPage() {
  let products: OlistProduct[] = [];
  try {
    products = await fetchProducts(0, 100);
  } catch {
    // Will show empty state
  }

  // Group products by category for category-based listing
  const categories = products.reduce<Record<string, OlistProduct[]>>(
    (acc, product) => {
      const category = product.product_category_name || "uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    },
    {}
  );

  const categoryEntries = Object.entries(categories).sort(([, a], [, b]) => b.length - a.length);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Danh mục sản phẩm
          </h1>
          <p className="mt-2 text-muted-foreground">
            Duyệt sản phẩm theo danh mục.{" "}
            {products.length > 0 &&
              `${products.length.toLocaleString()} sản phẩm thuộc ${categoryEntries.length} danh mục.`}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border bg-muted/50 py-20 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy sản phẩm. Vui lòng khởi tạo dữ liệu Olist.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {categoryEntries.map(([category, categoryProducts]) => (
              <section key={category}>
                <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {formatCategory(category)}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {categoryProducts.length} products
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {categoryProducts.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.product_id}
                      product={{
                        id: product.product_id,
                        name: formatCategory(
                          product.product_category_name || "Product"
                        ),
                        category: product.product_category_name,
                        weight: product.product_weight_g ?? undefined,
                      }}
                    />
                  ))}
                </div>
                {categoryProducts.length > 4 && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    + {categoryProducts.length - 4} more in this category
                  </p>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
