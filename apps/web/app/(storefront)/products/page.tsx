import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/product-card";

interface OlistProduct {
  product_id: string;
  product_category_name: string;
  product_photos_qty: number | null;
  product_weight_g: number | null;
}

export default async function ProductsPage() {
  let products: OlistProduct[] = [];
  try {
    products = await fetchProducts();
  } catch {
    // Will show empty state
  }

  // Group products by category for category-based listing
  const categories = products.reduce<Record<string, OlistProduct[]>>((acc, product) => {
    const category = product.product_category_name || "uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const categoryEntries = Object.entries(categories).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Product Categories</h1>
          <p className="text-muted-foreground mt-2">
            Browse our catalog by category. {products.length.toLocaleString()} products across {categoryEntries.length} categories.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-muted rounded-xl">
            <p>No products found. Please initialize the database with Olist data.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {categoryEntries.map(([category, categoryProducts]) => (
              <section key={category}>
                <h2 className="text-2xl font-semibold capitalize mb-4 border-b pb-2">
                  {category.replace(/_/g, " ")}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({categoryProducts.length} products)
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categoryProducts.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.product_id}
                      product={{
                        id: product.product_id,
                        name: product.product_category_name?.replace(/_/g, " ") || "Product",
                        category: product.product_category_name?.replace(/_/g, " "),
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
