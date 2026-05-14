"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Search, Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      // Find order by ID
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetchWithAuth(`${API_BASE}/orders?limit=1000`);
      const allOrders = await res.json();
      const foundOrder = allOrders.find((o: any) => o.order_id === orderId.trim());

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError("Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn.");
      }
    } catch (err) {
      setError("Không thể tải dữ liệu theo dõi.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: "Đã đặt", status: "created", icon: Clock },
    { label: "Đang giao", status: "shipped", icon: Truck },
    { label: "Đã giao", status: "delivered", icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order?.order_status);

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Theo dõi đơn hàng</h1>
        <p className="text-muted-foreground">Nhập mã đơn hàng để xem cập nhật giao hàng theo thời gian thực.</p>
      </div>

      <Card className="mb-8 border-primary/20 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/50" />
        <CardContent className="p-8">
          <form onSubmit={handleTrack} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="VD: 53cd36e272c214c31058d..." 
                className="pl-10 h-12"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="h-12 px-8">
              {loading ? "Đang tìm..." : "Tra cứu"}
            </Button>
          </form>
          {error && <p className="mt-4 text-sm text-destructive font-medium">{error}</p>}
        </CardContent>
      </Card>

      <AnimatePresence>
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Trạng thái đơn hàng</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">ID: {order.order_id}</p>
                </div>
                <Badge variant="secondary" className="px-3 py-1 capitalize">
                  {order.order_status}
                </Badge>
              </CardHeader>
              <CardContent className="p-8 border-t bg-muted/5">
                <div className="relative flex justify-between">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 w-full h-0.5 bg-muted -z-10" />
                  <div 
                    className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-1000 -z-10" 
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                  />

                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = idx <= currentStepIndex;
                    return (
                      <div key={step.label} className="flex flex-col items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                          isActive ? "bg-primary border-primary text-primary-foreground shadow-lg" : "bg-card border-muted text-muted-foreground"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12 grid grid-cols-2 gap-6 pt-8 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Ngày mua</p>
                    <p className="text-sm mt-1">{order.order_purchase_timestamp}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Dự kiến giao</p>
                    <p className="text-sm mt-1">{order.order_estimated_delivery_date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
