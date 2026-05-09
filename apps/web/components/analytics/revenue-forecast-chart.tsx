"use client";

import {
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  revenue: {
    label: "Actual Revenue",
    color: "#14b8a6",
  },
  forecast: {
    label: "Forecast",
    color: "#6366f1",
  },
} satisfies ChartConfig;

interface RevenueForecastChartProps {
  data: { month: string; revenue?: number; forecast?: number }[];
}

export function RevenueForecastChart({ data }: RevenueForecastChartProps) {
  const hasData = data && data.length > 0;

  const chartData = hasData
    ? data
    : [
        { month: "Jan", revenue: 12000, forecast: 12500 },
        { month: "Feb", revenue: 14200, forecast: 14000 },
        { month: "Mar", revenue: 13800, forecast: 14500 },
        { month: "Apr", revenue: 16500, forecast: 16000 },
        { month: "May", revenue: 15800, forecast: 16800 },
        { month: "Jun", revenue: 17200, forecast: 17500 },
        { month: "Jul", revenue: undefined, forecast: 18200 },
        { month: "Aug", revenue: undefined, forecast: 19000 },
        { month: "Sep", revenue: undefined, forecast: 19800 },
      ];

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
          <h3 className="text-lg font-semibold text-white">
            Revenue Forecast
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Actual vs predicted revenue trajectory
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs font-medium text-indigo-400">
            Forecast
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ComposedChart
            data={chartData}
            margin={{ left: 0, right: 0, top: 12, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="revenueForecastGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
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
                  className="rounded-xl border-zinc-800 bg-zinc-900/95 backdrop-blur-sm"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#revenueForecastGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#14b8a6",
                stroke: "#0d9488",
                strokeWidth: 2,
              }}
              connectNulls={false}
            />
            <Line
              dataKey="forecast"
              type="monotone"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#6366f1",
                stroke: "#4f46e5",
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-5 rounded-full bg-teal-500" />
            <span className="text-xs text-zinc-400">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-5 rounded-full border-b-2 border-dashed border-indigo-500" />
            <span className="text-xs text-zinc-400">Forecast</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
