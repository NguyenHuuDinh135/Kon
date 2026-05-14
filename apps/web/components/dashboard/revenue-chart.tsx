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
    color: "var(--color-primary)",
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
      className="h-full overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b p-6">
        <div>
          <h3 className="text-lg font-semibold">Doanh thu theo thời gian</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng phí vận chuyển hàng tháng từ đơn hàng Olist
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Live</span>
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
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="50%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="none"
              opacity={0.1}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              width={50}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.2, strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  hideLabel
                  className="rounded-xl border bg-background/95 backdrop-blur-sm"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--color-primary)",
                stroke: "var(--color-background)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </motion.div>
  );
}
