"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@workspace/ui/components/chart";
import { motion } from "motion/react";
import { TrendingUp, Info } from "lucide-react";

const chartConfig = {
  actual: {
    label: "Actual",
    color: "var(--color-primary)",
  },
  forecast: {
    label: "Forecast",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

interface RevenueForecastChartProps {
  data: { historical: any[]; forecast: any[] } | any[];
}

export function RevenueForecastChart({ data }: RevenueForecastChartProps) {
  const chartData = (() => {
    if (Array.isArray(data)) return data;
    const historical = (data?.historical || []).map((d: any) => ({
      month: d.month,
      actual: d.revenue,
    }));
    const forecast = (data?.forecast || []).map((d: any) => ({
      month: d.month,
      forecast: d.revenue,
    }));
    return [...historical, ...forecast];
  })();

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
          <h3 className="text-lg font-semibold">
            Dự báo doanh thu
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Dự phóng hồi quy tuyến tính 3 tháng
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">ML Active</span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <ComposedChart
            data={chartData}
            margin={{ left: 0, right: 0, top: 12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
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
                  className="rounded-xl border bg-background/95 backdrop-blur-sm"
                />
              }
            />
            <Area
              dataKey="actual"
              type="monotone"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#actualGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--color-primary)",
                stroke: "var(--color-background)",
                strokeWidth: 2,
              }}
            />
            <Line
              dataKey="forecast"
              type="monotone"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: "var(--color-chart-2)" }}
              activeDot={{
                r: 5,
                fill: "var(--color-chart-2)",
                stroke: "var(--color-background)",
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ChartContainer>

        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-primary" />
            <span className="text-xs text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 border-t-2 border-dashed border-chart-2" />
            <span className="text-xs text-muted-foreground">Forecast</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
