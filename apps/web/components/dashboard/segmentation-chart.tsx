"use client";

import { Pie, PieChart, Cell, Label } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { motion } from "motion/react";
import { MagicCard } from "@workspace/ui/components/magic-card";

const COLORS = ["#14b8a6", "#06b6d4", "#f59e0b", "#ef4444"];

const clusterLabels = [
  "VIP Customers",
  "Loyal Customers",
  "At Risk",
  "Hibernating"
];

const chartConfig = {
  count: {
    label: "Customers",
  },
  cluster0: { label: "VIP", color: COLORS[0] },
  cluster1: { label: "Loyal", color: COLORS[1] },
  cluster2: { label: "At Risk", color: COLORS[2] },
  cluster3: { label: "Hibernating", color: COLORS[3] },
} satisfies ChartConfig;

interface SegmentationChartProps {
  data: { Cluster: number; count: number }[];
}

export function SegmentationChart({ data }: SegmentationChartProps) {
  const chartData = data.map((item) => ({
    name: clusterLabels[item.Cluster] || `Cluster ${item.Cluster}`,
    value: item.count,
    fill: COLORS[item.Cluster % COLORS.length],
  }));

  const totalCustomers = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
    >
      <MagicCard
        className="h-full rounded-2xl"
        gradientSize={250}
        gradientColor="#1a1a2e"
        gradientFrom="#14b8a6"
        gradientTo="#06b6d4"
      >
        <div className="flex h-full flex-col p-6">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-white">Segmentation</h3>
            <p className="mt-1 text-sm text-zinc-500">
              K-Means RFM clustering
            </p>
          </div>

          {/* Chart */}
          <div className="flex flex-1 items-center justify-center py-4">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[220px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      className="rounded-xl border-zinc-800 bg-zinc-900/95 backdrop-blur-sm"
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  strokeWidth={2}
                  stroke="rgba(9,9,11,0.8)"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      className="transition-opacity duration-200 hover:opacity-80"
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 8}
                              className="fill-white text-2xl font-bold"
                            >
                              {totalCustomers}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 12}
                              className="fill-zinc-500 text-xs"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: item.fill,
                    boxShadow: `0 0 6px ${item.fill}40`,
                  }}
                />
                <span className="truncate text-xs text-zinc-400">
                  {item.name}
                </span>
                <span className="ml-auto text-xs font-medium text-zinc-300">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </MagicCard>
    </motion.div>
  );
}
