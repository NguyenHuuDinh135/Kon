"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@workspace/ui/components/chart";
import { motion } from "motion/react";

const chartConfig = {
  clv: {
    label: "CLV",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

interface CLVBySegmentChartProps {
  data: { cluster_label: string; avg_clv: number }[];
}

export function CLVBySegmentChart({ data }: CLVBySegmentChartProps) {
  // Map data to expected format if needed
  const chartData = data.map(item => ({
    segment: item.cluster_label || "Unknown",
    clv: item.avg_clv || 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="h-full overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="border-b p-6">
        <h3 className="text-lg font-semibold">CLV by Segment</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Average lifetime value by RFM cluster
        </p>
      </div>

      {/* Chart */}
      <div className="p-6 pt-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            data={chartData}
            margin={{ left: 0, right: 0, top: 12, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="none"
              opacity={0.1}
            />
            <XAxis
              dataKey="segment"
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
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              width={50}
            />
            <ChartTooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.2 }}
              content={
                <ChartTooltipContent
                  hideLabel
                  className="rounded-xl border bg-background/95 backdrop-blur-sm"
                />
              }
            />
            <Bar
              dataKey="clv"
              fill="var(--color-primary)"
              radius={[6, 6, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </motion.div>
  );
}
