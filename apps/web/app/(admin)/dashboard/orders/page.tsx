"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetchWithAuth(`${API_BASE}/orders?limit=20`);
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-primary/10 text-primary border-primary/20";
      case "shipped": return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "canceled": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Quản lý đơn hàng</h2>
        <p className="text-muted-foreground">
          Theo dõi và quản lý tất cả giao dịch trong hệ thống.
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày mua</TableHead>
              <TableHead>Dự kiến giao</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Không tìm thấy đơn hàng.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.order_id}>
                  <TableCell className="font-mono text-xs">{o.order_id.substring(0, 12)}...</TableCell>
                  <TableCell className="font-mono text-xs">{o.customer_id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(o.order_status)}>
                      {o.order_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {o.order_purchase_timestamp}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {o.order_estimated_delivery_date}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
