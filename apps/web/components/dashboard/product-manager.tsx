"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "@/lib/api";

interface Product {
  product_id: string;
  product_category_name: string;
  product_name_length: number | null;
  product_description_length: number | null;
  product_photos_qty: number | null;
  product_weight_g: number | null;
}

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    product_category_name: "",
    product_weight_g: 0,
    product_photos_qty: 1,
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch {
      // Error handled by displaying empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleOpenAdd = () => {
    setCurrentProduct(null);
    setFormData({
      product_category_name: "",
      product_weight_g: 0,
      product_photos_qty: 1,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      product_category_name: product.product_category_name || "",
      product_weight_g: product.product_weight_g || 0,
      product_photos_qty: product.product_photos_qty || 1,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await deleteProduct(productId);
      loadProducts();
    } catch {
      alert("Xóa sản phẩm thất bại");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentProduct) {
        await updateProduct(currentProduct.product_id, formData);
      } else {
        await createProduct(formData);
      }
      setIsDialogOpen(false);
      loadProducts();
    } catch {
      alert("Lưu sản phẩm thất bại");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Sản phẩm</h2>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Tên danh mục</Label>
                <Input
                  id="category"
                  value={formData.product_category_name}
                  onChange={(e) => setFormData({ ...formData, product_category_name: e.target.value })}
                  placeholder="VD: electronics, furniture, toys"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="weight">Trọng lượng (g)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="1"
                    value={formData.product_weight_g}
                    onChange={(e) => setFormData({ ...formData, product_weight_g: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="photos">Số ảnh</Label>
                  <Input
                    id="photos"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.product_photos_qty}
                    onChange={(e) => setFormData({ ...formData, product_photos_qty: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border bg-card">
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã SP</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Trọng lượng (g)</TableHead>
                <TableHead>Ảnh</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Không tìm thấy sản phẩm.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell className="font-mono text-xs">{product.product_id.slice(0, 8)}...</TableCell>
                    <TableCell className="capitalize">{product.product_category_name || "—"}</TableCell>
                    <TableCell>{product.product_weight_g ?? "—"}</TableCell>
                    <TableCell>{product.product_photos_qty ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(product.product_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
