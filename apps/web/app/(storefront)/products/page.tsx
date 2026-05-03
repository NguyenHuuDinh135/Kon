import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/product-card";

export default async function ProductsPage() {
  let products = [];
  try {
    products = await fetchProducts();
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Our Products</h1>
          <p className="text-muted-foreground mt-2">Browse our full catalog of high-quality items.</p>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-20 bg-muted rounded-xl">
            <p>No products found. Please initialize the database with Northwind data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard 
                key={product.ProductID} 
                product={{
                  id: product.ProductID,
                  name: product.ProductName,
                  price: product.UnitPrice || 0,
                  quantityPerUnit: product.QuantityPerUnit
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
