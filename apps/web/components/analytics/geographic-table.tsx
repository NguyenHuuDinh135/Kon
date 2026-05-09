"use client";

import { motion } from "motion/react";
import { Globe } from "lucide-react";

interface GeographicTableProps {
  data: any[];
}

const FALLBACK_DATA = [
  { state: "SP", customers: 412, revenue: 128500, avgOrder: 312 },
  { state: "RJ", customers: 198, revenue: 67200, avgOrder: 339 },
  { state: "MG", customers: 156, revenue: 48900, avgOrder: 313 },
  { state: "RS", customers: 112, revenue: 38400, avgOrder: 343 },
  { state: "PR", customers: 98, revenue: 31200, avgOrder: 318 },
  { state: "SC", customers: 87, revenue: 27600, avgOrder: 317 },
  { state: "BA", customers: 76, revenue: 22800, avgOrder: 300 },
  { state: "DF", customers: 65, revenue: 21500, avgOrder: 331 },
];

export function GeographicTable({ data }: GeographicTableProps) {
  const stateMap: Record<string, { customers: number; revenue: number }> = {};

  if (data && data.length > 0) {
    data.forEach((item: any) => {
      const state = item.customer_state || item.state;
      if (state) {
        if (!stateMap[state]) {
          stateMap[state] = { customers: 0, revenue: 0 };
        }
        stateMap[state].customers += 1;
        stateMap[state].revenue += item.clv || item.CLV || item.revenue || 0;
      }
    });
  }

  const hasRealData = Object.keys(stateMap).length > 0;

  const tableData = hasRealData
    ? Object.entries(stateMap)
        .map(([state, { customers, revenue }]) => ({
          state,
          customers,
          revenue: Math.round(revenue),
          avgOrder: customers > 0 ? Math.round(revenue / customers) : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8)
    : FALLBACK_DATA;

  const maxRevenue = Math.max(...tableData.map((d) => d.revenue));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="h-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-zinc-800/50 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Geographic Distribution
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Revenue by state (Olist e-commerce data)
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5">
          <Globe className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-cyan-400">Geo</span>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 pt-4">
        <div className="overflow-hidden rounded-xl border border-zinc-800/30">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-800/20">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  State
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Customers
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Revenue
                </th>
                <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 sm:table-cell">
                  Avg Order
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr
                  key={row.state}
                  className="border-b border-zinc-800/20 transition-colors last:border-0 hover:bg-zinc-800/30"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex h-6 w-8 items-center justify-center rounded bg-zinc-800/50 text-xs font-semibold text-zinc-200">
                      {row.state}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-zinc-300">
                    {row.customers.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-white">
                    ${row.revenue.toLocaleString()}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-sm text-zinc-400 sm:table-cell">
                    ${row.avgOrder}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all"
                          style={{
                            width: `${(row.revenue / maxRevenue) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-zinc-500">
                        {((row.revenue / maxRevenue) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
