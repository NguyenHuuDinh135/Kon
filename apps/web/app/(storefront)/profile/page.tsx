"use client";

import { useEffect, useState } from "react";
import { fetchMe, fetchWithAuth } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { User, Mail, Shield, Package, Calendar } from "lucide-react";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const userData = await fetchMe();
        setUser(userData);
        
        // Fetch recent orders for this user (mocking or real if customer_id matches)
        // Since it's a demo, we'll just show some system orders
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const ordersRes = await fetchWithAuth(`${API_BASE}/orders?limit=5`);
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Tài khoản của bạn</h1>
        <p className="text-muted-foreground mt-2">Quản lý hồ sơ và theo dõi hoạt động mua sắm.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <div className="h-24 bg-primary/10" />
            <CardHeader className="relative -mt-12">
              <div className="h-20 w-20 rounded-2xl bg-card border-4 border-background flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="pt-4">{user?.username}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary" className="capitalize">{user?.role}</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Tham gia {new Date(user?.CreatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng gần đây</CardTitle>
              <CardDescription>Các giao dịch mới nhất liên kết với tài khoản của bạn.</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Bạn chưa có đơn hàng nào.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.order_id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Order #{order.order_id.substring(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{order.order_purchase_timestamp}</p>
                      </div>
                      <Badge variant={order.order_status === "delivered" ? "default" : "outline"}>
                        {order.order_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
