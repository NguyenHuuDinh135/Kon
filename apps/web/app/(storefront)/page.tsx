import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product-card";

async function getFeaturedProducts() {
  // In a real app, this would be a server-side fetch to the FastAPI backend
  // For now, we'll mock it to ensure the UI looks good
  return [
    { id: 1, name: "Chai", price: 18.0, category: "Beverages", image: "https://images.unsplash.com/photo-1544787210-2213d4b2cc27?auto=format&fit=crop&q=80&w=400" },
    { id: 2, name: "Chang", price: 19.0, category: "Beverages", image: "https://images.unsplash.com/photo-1514944288352-fffbb99f01ef?auto=format&fit=crop&q=80&w=400" },
    { id: 3, name: "Aniseed Syrup", price: 10.0, category: "Condiments", image: "https://images.unsplash.com/photo-1589118949245-7d48d504544c?auto=format&fit=crop&q=80&w=400" },
    { id: 4, name: "Chef Anton's Cajun Seasoning", price: 22.0, category: "Condiments", image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=400" },
  ];
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-muted">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background to-background/20 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200" 
            alt="Hero Background" 
            className="h-full w-full object-cover opacity-50"
          />
        </div>
        <div className="container relative z-20 px-4">
          <div className="max-w-2xl space-y-6">
            <Badge variant="outline" className="px-4 py-1 border-primary/50 text-primary">
              <Sparkles className="mr-2 h-3 w-3 fill-primary" />
              AI-Powered Recommendations
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
              Next-Gen Shopping <br />
              <span className="text-primary">Powered by AI.</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Experience the future of ERP & CRM integrated shopping. Smart suggestions, personalized deals, and seamless checkout.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="px-8 h-12" asChild>
                <Link href="/products">
                  Shop All Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 h-12">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-muted-foreground">Handpicked selections just for you.</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* AI Intelligence Banner */}
      <section className="container mx-auto px-4">
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex-1 space-y-4 z-10">
            <h3 className="text-2xl font-bold">Smart Shopping Agent</h3>
            <p className="text-muted-foreground max-w-md">
              Our AI analyzes your preferences to suggest products that fit your lifestyle. Save time and find exactly what you need.
            </p>
            <Button className="rounded-full">Try AI Search</Button>
          </div>
          <div className="flex-1 flex justify-center z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-primary blur-3xl opacity-20" />
              <div className="bg-background border rounded-2xl p-6 shadow-2xl w-full max-w-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <div className="h-2 w-32 bg-muted rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-muted rounded-full" />
                  <div className="h-2 w-4/5 bg-muted rounded-full" />
                </div>
                <div className="pt-2 flex gap-2">
                  <div className="size-12 rounded bg-muted" />
                  <div className="size-12 rounded bg-muted" />
                  <div className="size-12 rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
