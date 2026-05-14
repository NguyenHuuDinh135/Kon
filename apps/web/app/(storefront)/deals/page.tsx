import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Tag } from "lucide-react";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { formatCategory, getCategoryImage } from "@/lib/product-images";

interface OlistProduct {
  product_id: string;
  product_category_name: string;
  product_photos_qty: number | null;
  product_weight_g: number | null;
}

export default async function DealsPage() {
  let products: OlistProduct[] = [];
  try {
    products = await fetchProducts(0, 80);
  } catch {
    products = [];
  }

  // Group products by category
  const categoryMap = products.reduce<Record<string, OlistProduct[]>>(
    (acc, product) => {
      const cat = product.product_category_name || "uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    },
    {}
  );

  // Top categories by volume
  const topCategories = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 8);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <Badge
          variant="outline"
          className="mb-4 border-primary/30 bg-primary/5 px-4 py-1.5 text-primary"
        >
          <Sparkles className="mr-2 h-3 w-3" />
          Ưu đãi đặc biệt
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Ưu đãi hôm nay
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
          Khám phá danh mục phổ biến từ sàn Olist.{" "}
          {products.length > 0 &&
            `${products.length} sản phẩm trong ${Object.keys(categoryMap).length} danh mục.`}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <Card className="mx-auto max-w-md">
            <CardContent className="p-8">
              <p className="text-muted-foreground">
                Chưa có sản phẩm. Vui lòng khởi tạo cơ sở dữ liệu với dữ liệu Olist.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Popular Categories Grid */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Danh mục phổ biến
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {topCategories.map(([catName, catProducts]) => (
                <Link
                  key={catName}
                  href={`/products?category=${catName}`}
                  className="group"
                >
                  <Card className="overflow-hidden border-border/60 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={getCategoryImage(catName)}
                        alt={formatCategory(catName)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-sm font-semibold text-foreground">
                          {formatCategory(catName)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {catProducts.length} sản phẩm
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <Separator className="my-10" />

          {/* Products by Top Categories */}
          <section className="space-y-12">
            {topCategories.slice(0, 3).map(([catName, catProducts]) => (
              <div key={catName}>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">
                      {formatCategory(catName)}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {catProducts.length} sản phẩm
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/products?category=${catName}`}>
                      Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {catProducts.slice(0, 4).map((product) => (
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
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
