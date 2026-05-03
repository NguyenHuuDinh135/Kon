"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { NumberTicker } from "@workspace/ui/components/number-ticker";
import { BorderBeam } from "@workspace/ui/components/border-beam";
import { Users, ShoppingBag, DollarSign, AlertTriangle } from "lucide-react";

interface KPIStatsProps {
  data: {
    total_customers: number;
    total_orders: number;
    total_revenue: number;
    churn_alerts_count: number;
    avg_churn_risk: number;
  };
}

export function KPIStats({ data }: KPIStatsProps) {
  const stats = [
    {
      title: "Total Customers",
      value: data.total_customers,
      icon: Users,
      description: "ERP + CRM Integrated",
      color: "text-blue-500",
    },
    {
      title: "Total Orders",
      value: data.total_orders,
      icon: ShoppingBag,
      description: "Northwind Data",
      color: "text-green-500",
    },
    {
      title: "Total Revenue",
      value: data.total_revenue,
      icon: DollarSign,
      description: "Gross Freight",
      prefix: "$",
      decimalPlaces: 2,
      color: "text-yellow-500",
    },
    {
      title: "Churn Alerts",
      value: data.churn_alerts_count,
      icon: AlertTriangle,
      description: "AI Predicted Risk",
      color: "text-red-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={stat.title} className="relative overflow-hidden">
          {i === 3 && <BorderBeam size={250} duration={12} delay={9} />}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`size-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-baseline">
              {stat.prefix}
              <NumberTicker 
                value={stat.value} 
                decimalPlaces={stat.decimalPlaces || 0} 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
