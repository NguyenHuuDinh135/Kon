"use client";

import { motion } from "motion/react";
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
      title: "Tổng khách hàng",
      value: data.total_customers,
      icon: Users,
      description: "Tích hợp ERP + CRM",
      gradient: "from-chart-1/20 to-chart-1/5",
      iconBg: "bg-chart-1/10 border-chart-1/20",
      iconColor: "text-chart-1",
      sparkColor: "var(--color-chart-1)",
    },
    {
      title: "Tổng đơn hàng",
      value: data.total_orders,
      icon: ShoppingBag,
      description: "Dữ liệu Olist",
      gradient: "from-chart-2/20 to-chart-2/5",
      iconBg: "bg-chart-2/10 border-chart-2/20",
      iconColor: "text-chart-2",
      sparkColor: "var(--color-chart-2)",
    },
    {
      title: "Tổng doanh thu",
      value: data.total_revenue,
      icon: DollarSign,
      description: "Tổng phí vận chuyển",
      prefix: "$",
      decimalPlaces: 2,
      gradient: "from-chart-3/20 to-chart-3/5",
      iconBg: "bg-chart-3/10 border-chart-3/20",
      iconColor: "text-chart-3",
      sparkColor: "var(--color-chart-3)",
    },
    {
      title: "Cảnh báo rời bỏ",
      value: data.churn_alerts_count,
      icon: AlertTriangle,
      description: "AI dự đoán rủi ro",
      gradient: "from-destructive/20 to-destructive/5",
      iconBg: "bg-destructive/10 border-destructive/20",
      iconColor: "text-destructive",
      sparkColor: "var(--color-chart-4)",
      hasBeam: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="group relative overflow-hidden rounded-2xl border bg-card p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:bg-muted/30"
        >
          {stat.hasBeam && (
            <BorderBeam
              size={200}
              duration={10}
              colorFrom="var(--color-primary)"
              colorTo="var(--color-destructive)"
              borderWidth={1}
            />
          )}

          {/* Gradient background on hover */}
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
          />

          {/* Mini sparkline decoration */}
          <div className="pointer-events-none absolute right-4 top-4 opacity-30">
            <svg width="64" height="32" viewBox="0 0 64 32" fill="none">
              <path
                d="M0 28 C8 24, 12 20, 16 22 S24 12, 32 16 S40 8, 48 10 S56 4, 64 2"
                stroke={stat.sparkColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M0 28 C8 24, 12 20, 16 22 S24 12, 32 16 S40 8, 48 10 S56 4, 64 2 V32 H0 Z"
                fill={stat.sparkColor}
                opacity="0.05"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${stat.iconBg} transition-transform duration-300 group-hover:scale-110`}
              >
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </p>
              <div className="mt-1 flex items-baseline gap-0.5 text-3xl font-bold tracking-tight text-foreground">
                {stat.prefix && (
                  <span className="text-xl text-muted-foreground">{stat.prefix}</span>
                )}
                <NumberTicker
                  value={stat.value}
                  decimalPlaces={stat.decimalPlaces || 0}
                  className="text-foreground"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
