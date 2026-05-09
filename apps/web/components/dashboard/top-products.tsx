"use client";

import { motion } from "motion/react";
import { Package } from "lucide-react";

interface TopProductsProps {
  data: { productName: string; total_sold: number }[];
}

export function TopProducts({ data }: TopProductsProps) {
  const maxSold = Math.max(...data.map((p) => p.total_sold), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="h-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800/50 p-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50">
          <Package className="h-4 w-4 text-zinc-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Top Products</h3>
          <p className="text-sm text-zinc-500">Most ordered items</p>
        </div>
      </div>

      {/* Ranked List */}
      <div className="space-y-1 p-4">
        {data.map((product, index) => {
          const percentage = (product.total_sold / maxSold) * 100;

          return (
            <div
              key={product.productName}
              className="group relative flex items-center gap-4 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-zinc-800/30"
            >
              {/* Rank */}
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 text-xs font-bold text-zinc-400">
                {index + 1}
              </div>

              {/* Product info + bar */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-zinc-200">
                    {product.productName}
                  </span>
                  <span className="flex-shrink-0 text-xs font-semibold tabular-nums text-teal-400">
                    {product.total_sold.toLocaleString()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                      duration: 0.8,
                      delay: 0.3 + index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, #14b8a6 0%, #06b6d4 ${percentage}%)`,
                      boxShadow: "0 0 8px rgba(20, 184, 166, 0.3)",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
