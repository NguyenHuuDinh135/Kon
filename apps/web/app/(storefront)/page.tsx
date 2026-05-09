import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  Zap,
  ShoppingBag,
  TrendingUp,
  Brain,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";

async function getFeaturedProducts() {
  return [
    { id: 1, name: "Chai", price: 18.0, category: "Beverages", image: "https://images.unsplash.com/photo-1544787210-2213d4b2cc27?auto=format&fit=crop&q=80&w=400" },
    { id: 2, name: "Chang", price: 19.0, category: "Beverages", image: "https://images.unsplash.com/photo-1514944288352-fffbb99f01ef?auto=format&fit=crop&q=80&w=400" },
    { id: 3, name: "Aniseed Syrup", price: 10.0, category: "Condiments", image: "https://images.unsplash.com/photo-1589118949245-7d48d504544c?auto=format&fit=crop&q=80&w=400" },
    { id: 4, name: "Chef Anton's Cajun Seasoning", price: 22.0, category: "Condiments", image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=400" },
  ];
}

const categories = [
  { name: "Beverages", icon: ShoppingBag, count: 12, color: "from-teal-500/20 to-emerald-500/10" },
  { name: "Condiments", icon: Sparkles, count: 8, color: "from-amber-500/20 to-orange-500/10" },
  { name: "Dairy Products", icon: TrendingUp, count: 10, color: "from-blue-500/20 to-cyan-500/10" },
  { name: "Grains/Cereals", icon: BarChart3, count: 7, color: "from-violet-500/20 to-purple-500/10" },
  { name: "Meat/Poultry", icon: Zap, count: 6, color: "from-rose-500/20 to-red-500/10" },
  { name: "Seafood", icon: Users, count: 12, color: "from-indigo-500/20 to-blue-500/10" },
];

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="flex flex-col gap-0 pb-16">
      {/* Hero Section - Gradient with depth */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/8 blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-emerald-600/6 blur-[120px]" />
          <div className="absolute right-1/3 top-1/2 h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-[100px]" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="container relative z-10 mx-auto px-4 py-24">
          <div className="max-w-3xl space-y-8">
            <Badge
              variant="outline"
              className="border-teal-500/30 bg-teal-500/5 px-4 py-1.5 text-teal-400 backdrop-blur-sm"
            >
              <Sparkles className="mr-2 h-3 w-3 fill-teal-400" />
              AI-Powered Commerce Platform
            </Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-white md:text-8xl lg:text-9xl">
              Next-Gen
              <br />
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Shopping.
              </span>
            </h1>
            <p className="max-w-xl text-lg text-zinc-400 md:text-xl">
              Experience intelligent commerce with ML-driven recommendations,
              real-time analytics, and autonomous customer segmentation.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 text-white hover:from-teal-500 hover:to-emerald-500 hover:shadow-[0_0_24px_rgba(20,184,166,0.3)]"
                asChild
              >
                <Link href="/products">
                  Shop All Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-zinc-700 px-8 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/50"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Browse Categories
          </h2>
          <p className="mt-3 text-muted-foreground">
            Curated collections from Olist marketplace
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href="/products"
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              <div className="relative z-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-muted transition-transform duration-300 group-hover:scale-110">
                  <cat.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {cat.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cat.count} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Handpicked selections just for you.
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* AI Dashboard Promotion */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/50 bg-zinc-950 p-8 md:p-14">
          {/* Background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-teal-500/15 blur-[120px]" />
            <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-emerald-600/10 blur-[80px]" />
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-10 md:flex-row">
            <div className="flex-1 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5">
                <Brain className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium text-teal-400">
                  AI-Powered Dashboard
                </span>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Intelligent Business
                <br />
                Analytics
              </h3>
              <p className="max-w-md text-zinc-400">
                ML models predict customer churn, segment audiences with RFM
                scoring, and forecast revenue — all with real-time Olist data
                integration.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-500 hover:to-emerald-500"
                  asChild
                >
                  <Link href="/login">
                    Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Decorative dashboard preview */}
            <div className="flex-1">
              <div className="relative mx-auto max-w-sm">
                <div className="absolute inset-0 rounded-2xl bg-teal-500/10 blur-2xl" />
                <div className="relative space-y-3 rounded-2xl border border-zinc-800/50 bg-zinc-900/80 p-5 backdrop-blur-sm">
                  {/* Mini KPI row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Revenue", value: "$128k" },
                      { label: "Customers", value: "2.4k" },
                      { label: "Churn", value: "4.2%" },
                    ].map((kpi) => (
                      <div
                        key={kpi.label}
                        className="rounded-lg border border-zinc-800/30 bg-zinc-800/30 p-2 text-center"
                      >
                        <p className="text-xs text-zinc-500">{kpi.label}</p>
                        <p className="text-sm font-semibold text-white">
                          {kpi.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Mini chart placeholder */}
                  <div className="h-24 rounded-lg border border-zinc-800/30 bg-zinc-800/20 p-3">
                    <svg
                      viewBox="0 0 200 60"
                      className="h-full w-full"
                      fill="none"
                    >
                      <path
                        d="M0 50 C20 45, 40 35, 60 38 S100 20, 120 25 S160 10, 180 12 L200 8"
                        stroke="#14b8a6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                      <path
                        d="M0 50 C20 45, 40 35, 60 38 S100 20, 120 25 S160 10, 180 12 L200 8 V60 H0 Z"
                        fill="url(#miniGrad)"
                        opacity="0.15"
                      />
                      <defs>
                        <linearGradient
                          id="miniGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop
                            offset="100%"
                            stopColor="#14b8a6"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  {/* Mini list */}
                  <div className="space-y-1.5">
                    {["VIP Segment", "At Risk", "New Users"].map((seg) => (
                      <div
                        key={seg}
                        className="flex items-center justify-between rounded-md bg-zinc-800/20 px-3 py-1.5"
                      >
                        <span className="text-xs text-zinc-400">{seg}</span>
                        <div className="h-1.5 w-12 rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-teal-500"
                            style={{
                              width: `${seg === "VIP Segment" ? 85 : seg === "At Risk" ? 45 : 65}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
