"use client";

import { motion } from "motion/react";
import { Package, ExternalLink } from "lucide-react";

interface TopProductsProps {
  data: { product_id: string; product_category_name: string; count: number }[];
}

export function TopProducts({ data }: TopProductsProps) {
  // Sort and take top 5
  const topItems = [...data].sort((a, b) => b.count - a.count).slice(0, 5);
  const maxCount = topItems[0]?.count || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Sản phẩm bán chạy</h3>
            <p className="text-sm text-muted-foreground">Sản phẩm được đặt nhiều nhất</p>
          </div>
        </div>
        <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-1 p-4">
        {topItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Không tìm thấy sản phẩm.
          </div>
        ) : (
          topItems.map((item, i) => {
            const percentage = (item.count / maxCount) * 100;
            return (
              <div
                key={item.product_id}
                className="group relative flex items-center gap-4 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-muted/30"
              >
                {/* Rank */}
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                  {i + 1}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium">
                      {item.product_category_name?.replace(/_/g, " ") || "General Product"}
                    </span>
                    <span className="text-xs font-bold">{item.count} đơn</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className="h-full rounded-full bg-primary"
                      style={{
                        background: `linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary) ${percentage}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
