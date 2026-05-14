import { fetchProducts } from "@/lib/api";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default async function CategoriesPage() {
  let products = [];
  try {
    products = await fetchProducts(0, 5000);
  } catch {
    products = [];
  }

  const categoriesMap = products.reduce((acc: any, product: any) => {
    const category = product.product_category_name || "uncategorized";
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {});

  const categoryEntries = Object.entries(categoriesMap).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Duyệt danh mục</h1>
        <p className="text-muted-foreground mt-2">
          Khám phá đa dạng sản phẩm trong {categoryEntries.length} danh mục.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoryEntries.map(([category, count]: [string, any]) => (
          <Link
            key={category}
            href={`/products?category=${category}`}
            className="group flex items-center justify-between p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                <ShoppingBag className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div>
                <h3 className="font-semibold capitalize">{category.replace(/_/g, " ")}</h3>
                <p className="text-sm text-muted-foreground">{count} sản phẩm</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
