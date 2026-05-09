"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { motion } from "motion/react";
import { BarChart3 } from "lucide-react";

const chartConfig = {
  R: { label: "Recency", color: "#14b8a6" },
  F: { label: "Frequency", color: "#6366f1" },
  M: { label: "Monetary", color: "#f59e0b" },
} satisfies ChartConfig;

interface RFMDistributionChartProps {
  data: { customer_id?: string; R?: number; F?: number; M?: number }[];
}

export function RFMDistributionChart({ data }: RFMDistributionChartProps) {
  const hasRealData = data && data.length > 0 && data[0]?.R !== undefined;

  const chartData = hasRealData
    ? [1, 2, 3, 4, 5].map((score) => ({
        score: `Score ${score}`,
        R: data.filter((d) => d.R === score).length,
        F: data.filter((d) => d.F === score).length,
        M: data.filter((d) => d.M === score).length,
      }))
    : [
        { score: "Score 1", R: 45, F: 32, M: 28 },
        { score: "Score 2", R: 38, F: 42, M: 35 },
        { score: "Score 3", R: 52, F: 48, M: 44 },
        { score: "Score 4", R: 30, F: 36, M: 52 },
        { score: "Score 5", R: 22, F: 28, M: 38 },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-zinc-800/50 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">RFM Distribution</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Score distribution across R, F, M dimensions
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-teal-400" />
          <span className="text-xs font-medium text-teal-400">RFM</span>
        </div>
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
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="none"
            />
            <XAxis
              dataKey="score"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "#71717a", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#71717a", fontSize: 12 }}
              width={35}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="rounded-xl border-zinc-800 bg-zinc-900/95 backdrop-blur-sm"
                />
              }
            />
            <Bar
              dataKey="R"
              fill="#14b8a6"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
            <Bar
              dataKey="F"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
            <Bar
              dataKey="M"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-teal-500" />
            <span className="text-xs text-zinc-400">Recency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
            <span className="text-xs text-zinc-400">Frequency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
            <span className="text-xs text-zinc-400">Monetary</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
