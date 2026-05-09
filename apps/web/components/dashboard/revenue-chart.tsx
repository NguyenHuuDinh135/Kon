"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@workspace/ui/components/chart";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#14b8a6",
  },
} satisfies ChartConfig;

interface RevenueChartProps {
  data: { month: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-zinc-800/50 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Revenue Over Time</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Monthly gross freight from Northwind orders
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Live</span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart
            data={data}
            margin={{ left: 0, right: 0, top: 12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#14b8a6" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="none"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#71717a", fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              width={50}
            />
            <ChartTooltip
              cursor={{ stroke: "rgba(20, 184, 166, 0.2)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  hideLabel
                  className="rounded-xl border-zinc-800 bg-zinc-900/95 backdrop-blur-sm"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#14b8a6",
                stroke: "#0d9488",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </motion.div>
  );
}
