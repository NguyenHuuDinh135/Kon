"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { createOrder } from "@/lib/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { ShoppingBag, ChevronLeft, CreditCard, Truck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerID: "ALFKI", // Default for MVP
    shipName: "",
    shipAddress: "",
    shipCity: "",
    shipCountry: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        customer_id: formData.customerID,
        order_status: "created",
        items: items.map((item) => ({
          product_id: String(item.id),
          seller_id: null,
          price: item.price * item.quantity,
          freight_value: 10.0 / items.length,
        })),
      };

      await createOrder(orderData);
      
      setIsSuccess(true);
      clearCart();
      toast.success("Đặt hàng thành công!");
    } catch (error) {
      console.error("Order placement failed:", error);
      toast.error("Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="size-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Đặt hàng thành công!</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Cảm ơn bạn đã mua hàng. Đơn hàng đã được tiếp nhận và đang xử lý.
          Bạn sẽ nhận email xác nhận trong thời gian ngắn.
        </p>
        <Button asChild size="lg">
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <ShoppingBag className="size-16 text-muted-foreground/20 mb-6" />
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-8">Bạn cần thêm sản phẩm vào giỏ trước khi thanh toán.</p>
        <Button asChild>
          <Link href="/products">Xem sản phẩm</Link>
        </Button>
      </div>
    );
  }

  const shippingFee = 10.0;
  const grandTotal = totalPrice + shippingFee;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-8 pl-0">
        <Link href="/products" className="flex items-center gap-2">
          <ChevronLeft className="size-4" />
          Quay lại mua sắm
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="size-5" />
                Thông tin giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customerID">Mã khách hàng (MVP)</Label>
                  <Input 
                    id="customerID" 
                    name="customerID" 
                    value={formData.customerID} 
                    onChange={handleInputChange} 
                    placeholder="VD: ALFKI"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">Trong ứng dụng thực, đây sẽ là mã tài khoản của bạn.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shipName">Họ và tên</Label>
                  <Input 
                    id="shipName" 
                    name="shipName" 
                    value={formData.shipName} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shipAddress">Địa chỉ</Label>
                  <Input 
                    id="shipAddress" 
                    name="shipAddress" 
                    value={formData.shipAddress} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipCity">Thành phố</Label>
                  <Input 
                    id="shipCity" 
                    name="shipCity" 
                    value={formData.shipCity} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipCountry">Quốc gia</Label>
                  <Input 
                    id="shipCountry" 
                    name="shipCountry" 
                    value={formData.shipCountry} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" />
                Phương thức thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md bg-muted/50 border-primary/20 flex items-center justify-between">
                <div>
                  <p className="font-medium">Thanh toán khi nhận hàng</p>
                  <p className="text-sm text-muted-foreground">Thanh toán khi bạn nhận được đơn hàng.</p>
                </div>
                <div className="size-4 rounded-full border-4 border-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} <span className="text-xs">x{item.quantity}</span>
                    </span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span>${shippingFee.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span className="text-primary">${grandTotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                form="checkout-form" 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
