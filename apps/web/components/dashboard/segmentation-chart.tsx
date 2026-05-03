"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@workspace/ui/components/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

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
  const chartData = data.map((item, index) => ({
    name: clusterLabels[item.Cluster] || `Cluster ${item.Cluster}`,
    value: item.count,
    fill: COLORS[item.Cluster % COLORS.length],
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Customer Segmentation</CardTitle>
        <CardDescription>K-Means clustering based on RFM scores.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
