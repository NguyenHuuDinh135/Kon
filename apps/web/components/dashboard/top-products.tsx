"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@workspace/ui/components/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";

const chartConfig = {
  total_sold: {
    label: "Items Sold",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface TopProductsProps {
  data: { productName: string; total_sold: number }[];
}

export function TopProducts({ data }: TopProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Most ordered items in the Northwind database.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              left: 30,
            }}
          >
            <CartesianGrid horizontal={false} opacity={0.3} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="productName"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={150}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="total_sold"
              fill="var(--color-total_sold)"
              radius={5}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
