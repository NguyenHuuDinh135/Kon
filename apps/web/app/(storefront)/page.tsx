import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import Link from "next/link";
import { ArrowRight, Sparkles, Brain, ShoppingBag } from "lucide-react";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { formatCategory, getCategoryImage } from "@/lib/product-images";

interface OlistProduct {
  product_id: string;
  product_category_name: string;
  product_photos_qty: number | null;
  product_weight_g: number | null;
}

export default async function HomePage() {
  let products: OlistProduct[] = [];
  try {
    products = await fetchProducts(0, 50);
  } catch {
    products = [];
  }

  // Group by category and pick top 6 by product count
  const categoryMap = products.reduce<Record<string, OlistProduct[]>>(
    (acc, product) => {
      const cat = product.product_category_name || "uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    },
    {}
  );

  const topCategories = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 6);

  const allCategoryNames = topCategories.map(([name]) => name);
  const firstCategoryProducts = topCategories[0]?.[1] ?? [];

  return (
    <div className="flex flex-col gap-0 pb-16">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-3xl space-y-6">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/5 px-4 py-1.5 text-primary"
            >
              <Sparkles className="mr-2 h-3 w-3" />
              Nền tảng thương mại AI
            </Badge>
            <h1 className="text-5xl font-bold tracking-tighter text-foreground md:text-7xl">
              Khám phá sản phẩm
              <br />
              <span className="text-primary">Từ Olist Marketplace</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Duyệt {products.length.toLocaleString()}+ sản phẩm thuộc{" "}
              {Object.keys(categoryMap).length} danh mục từ hệ sinh thái
              thương mại điện tử hàng đầu Brazil.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" className="h-12 rounded-xl px-8" asChild>
                <Link href="/products">
                  Xem tất cả sản phẩm <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl px-8"
                asChild
              >
                <Link href="/deals">Ưu đãi hôm nay</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Danh mục phổ biến
          </h2>
          <p className="mt-2 text-muted-foreground">
            Mua sắm theo các danh mục sản phẩm phổ biến nhất
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {topCategories.map(([catName, catProducts]) => (
            <Link
              key={catName}
              href={`/products?category=${catName}`}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={getCategoryImage(catName)}
                  alt={formatCategory(catName)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {formatCategory(catName)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {catProducts.length} sản phẩm
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Separator className="mx-auto w-11/12" />

      {/* Featured Products Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Sản phẩm nổi bật
            </h2>
            <p className="mt-1 text-muted-foreground">
              {allCategoryNames.length > 0
                ? `Lựa chọn hàng đầu từ ${formatCategory(allCategoryNames[0] ?? "")}`
                : "Sản phẩm được chọn lọc"}
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products">
              Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {firstCategoryProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product.product_id}
              product={{
                id: product.product_id,
                name: formatCategory(product.product_category_name || "Product"),
                category: product.product_category_name,
                weight: product.product_weight_g ?? undefined,
              }}
            />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      {products.length > 8 && (
        <section className="container mx-auto px-4 pb-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Bán chạy nhất
              </h2>
              <p className="mt-1 text-muted-foreground">
                Phổ biến nhất trên tất cả danh mục
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">
                Xem thêm <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(8, 12).map((product) => (
              <ProductCard
                key={product.product_id}
                product={{
                  id: product.product_id,
                  name: formatCategory(product.product_category_name || "Product"),
                  category: product.product_category_name,
                  weight: product.product_weight_g ?? undefined,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* AI Dashboard CTA */}
      <section className="container mx-auto px-4 pb-16">
        <Card className="relative overflow-hidden border bg-card">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-secondary/5 blur-[80px]" />
          </div>
          <CardContent className="relative z-10 flex flex-col items-center gap-8 p-8 md:flex-row md:p-12">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  AI-Powered Dashboard
                </span>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-foreground">
                Intelligent Business Analytics
              </h3>
              <p className="max-w-md text-muted-foreground">
                ML models predict customer churn, segment audiences with RFM
                scoring, and forecast revenue with real Olist data.
              </p>
              <Button className="rounded-xl px-8" asChild>
                <Link href="/login">
                  Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-shrink-0">
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl border bg-muted/50">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
