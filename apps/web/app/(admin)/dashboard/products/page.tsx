import { ProductManager } from "@/components/dashboard/product-manager";

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
        <p className="text-muted-foreground">
          Manage your product catalog, prices, and stock levels.
        </p>
      </div>

      <ProductManager />
    </div>
  );
}
