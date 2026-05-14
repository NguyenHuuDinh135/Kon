"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { motion } from "motion/react";

const chartConfig = {
  R: { label: "Recency", color: "var(--color-chart-1)" },
  F: { label: "Frequency", color: "var(--color-chart-2)" },
  M: { label: "Monetary", color: "var(--color-chart-3)" },
} satisfies ChartConfig;

interface RFMDistributionChartProps {
  data: { quintile: number; R: number; F: number; M: number }[];
}

export function RFMDistributionChart({ data }: RFMDistributionChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="h-full overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl"
    >
      <div className="border-b p-6">
        <h3 className="text-lg font-semibold">Phân phối RFM</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Phân phối quintile theo các chỉ số (1-5)
        </p>
      </div>

      <div className="p-6 pt-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            data={data}
            margin={{ left: 0, right: 0, top: 12, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="none"
              opacity={0.1}
            />
            <XAxis
              dataKey="quintile"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              width={50}
            />
            <ChartTooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.2 }}
              content={
                <ChartTooltipContent
                  className="rounded-xl border bg-background/95 backdrop-blur-sm"
                />
              }
            />
            <Bar
              dataKey="R"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="F"
              fill="var(--color-chart-2)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="M"
              fill="var(--color-chart-3)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-chart-1" />
            <span className="text-xs text-muted-foreground">Recency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-chart-2" />
            <span className="text-xs text-muted-foreground">Frequency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-chart-3" />
            <span className="text-xs text-muted-foreground">Monetary</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
