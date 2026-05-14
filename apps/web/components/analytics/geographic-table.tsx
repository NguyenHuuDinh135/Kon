"use client";

import { motion } from "motion/react";
import { Globe } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";

interface GeographicTableProps {
  data: { customer_state: string; total_revenue: number; customer_count: number; churn_rate: number }[];
}

export function GeographicTable({ data }: GeographicTableProps) {
  // Take top 8 states by revenue
  const topStates = [...data].sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 8);
  const maxRevenue = topStates[0]?.total_revenue || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="h-full overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 border-b p-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
          <Globe className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Hiệu suất theo khu vực
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Doanh thu và tương tác theo vị trí khách hàng
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider">
                Bang
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">
                Doanh thu
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">
                Khách hàng
              </TableHead>
              <TableHead className="hidden text-right text-xs uppercase tracking-wider sm:table-cell">
                Thị phần
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">
                Churn
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topStates.map((state, i) => (
              <TableRow key={`${state.customer_state}-${i}`}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-8 items-center justify-center rounded bg-muted text-xs font-semibold">
                      {state.customer_state}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-sm">
                  ${(state.total_revenue / 1000).toFixed(1)}k
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-sm font-medium">
                  {state.customer_count}
                </TableCell>
                <TableCell className="hidden px-4 py-3 text-right text-sm sm:table-cell">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(state.total_revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <span className={`text-xs font-bold ${state.churn_rate > 0.05 ? "text-destructive" : "text-chart-1"}`}>
                    {(state.churn_rate * 100).toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
