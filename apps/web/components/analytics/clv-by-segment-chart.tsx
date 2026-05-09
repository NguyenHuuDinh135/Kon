"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { motion } from "motion/react";
import { DollarSign } from "lucide-react";

const chartConfig = {
  clv: {
    label: "Avg CLV",
    color: "#14b8a6",
  },
} satisfies ChartConfig;

interface CLVBySegmentChartProps {
  data: any[];
}

export function CLVBySegmentChart({ data }: CLVBySegmentChartProps) {
  const segmentMap: Record<string, { total: number; count: number }> = {};

  if (data && data.length > 0) {
    data.forEach((item: any) => {
      const segment = item.segment || item.cluster_label || "Unknown";
      if (!segmentMap[segment]) {
        segmentMap[segment] = { total: 0, count: 0 };
      }
      segmentMap[segment].total += item.clv || item.CLV || 0;
      segmentMap[segment].count += 1;
    });
  }

  const hasRealData = Object.keys(segmentMap).length > 0;

  const chartData = hasRealData
    ? Object.entries(segmentMap)
        .map(([segment, { total, count }]) => ({
          segment,
          clv: Math.round(total / count),
        }))
        .sort((a, b) => b.clv - a.clv)
    : [
        { segment: "VIP", clv: 2450 },
        { segment: "Loyal", clv: 1820 },
        { segment: "At Risk", clv: 980 },
        { segment: "Casual", clv: 420 },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="h-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-zinc-800/50 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">CLV by Segment</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Average lifetime value per customer segment
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
          <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">CLV</span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 20, top: 12, bottom: 0 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="none"
            />
            <YAxis
              dataKey="segment"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              width={70}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#71717a", fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="rounded-xl border-zinc-800 bg-zinc-900/95 backdrop-blur-sm"
                />
              }
            />
            <Bar
              dataKey="clv"
              fill="#14b8a6"
              radius={[0, 6, 6, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </motion.div>
  );
}
