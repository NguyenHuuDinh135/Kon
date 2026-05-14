import { ProductManager } from "@/components/dashboard/product-manager";

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Quản lý kho hàng</h2>
        <p className="text-muted-foreground">
          Quản lý danh mục sản phẩm, giá cả và tồn kho.
        </p>
      </div>

      <ProductManager />
    </div>
  );
}
