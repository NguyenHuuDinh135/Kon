"use client";

import { useEffect, useState } from "react";
import { fetchMe, fetchWithAuth } from "@/lib/api";
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetchWithAuth(`${API_BASE}/customers?limit=20`);
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error("Failed to load customers:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Quản lý khách hàng</h2>
        <p className="text-muted-foreground">
          Xem và phân tích dữ liệu khách hàng từ hệ thống Olist.
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã KH</TableHead>
              <TableHead>Mã định danh</TableHead>
              <TableHead>Thành phố</TableHead>
              <TableHead>Bang</TableHead>
              <TableHead>Mã bưu điện</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Không tìm thấy khách hàng.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.customer_id}>
                  <TableCell className="font-mono text-xs">{c.customer_id.substring(0, 8)}...</TableCell>
                  <TableCell className="font-mono text-xs">{c.customer_unique_id?.substring(0, 8)}...</TableCell>
                  <TableCell className="capitalize">{c.customer_city}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.customer_state}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.customer_zip_code_prefix}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
