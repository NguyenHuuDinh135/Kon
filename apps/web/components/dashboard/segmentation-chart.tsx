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

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const chartConfig = {
  count: {
    label: "Customers",
  },
} satisfies ChartConfig;

interface SegmentationChartProps {
  data: { segment: string; count: number }[];
}

export function SegmentationChart({ data }: SegmentationChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.segment,
    value: item.count,
    fill: COLORS[index % COLORS.length],
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
        gradientColor="var(--color-primary)"
        gradientOpacity={0.05}
      >
        <div className="flex h-full flex-col p-6">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold">Customer Segments</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              K-Means RFM Clustering
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
                      className="rounded-xl border bg-background/95 backdrop-blur-sm"
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
                  stroke="var(--color-background)"
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
                              className="fill-foreground text-2xl font-bold"
                            >
                              {totalCustomers}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 12}
                              className="fill-muted-foreground text-xs"
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
                  }}
                />
                <span className="truncate text-xs text-muted-foreground">
                  {item.name}
                </span>
                <span className="ml-auto text-xs font-medium">
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
