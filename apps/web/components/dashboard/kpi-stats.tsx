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
      title: "Total Customers",
      value: data.total_customers,
      icon: Users,
      description: "ERP + CRM Integrated",
      gradient: "from-blue-500/20 to-cyan-500/5",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      iconColor: "text-blue-400",
      sparkColor: "#3b82f6",
    },
    {
      title: "Total Orders",
      value: data.total_orders,
      icon: ShoppingBag,
      description: "Northwind Data",
      gradient: "from-emerald-500/20 to-teal-500/5",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      iconColor: "text-emerald-400",
      sparkColor: "#10b981",
    },
    {
      title: "Total Revenue",
      value: data.total_revenue,
      icon: DollarSign,
      description: "Gross Freight",
      prefix: "$",
      decimalPlaces: 2,
      gradient: "from-amber-500/20 to-yellow-500/5",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      iconColor: "text-amber-400",
      sparkColor: "#f59e0b",
    },
    {
      title: "Churn Alerts",
      value: data.churn_alerts_count,
      icon: AlertTriangle,
      description: "AI Predicted Risk",
      gradient: "from-rose-500/20 to-red-500/5",
      iconBg: "bg-rose-500/10 border-rose-500/20",
      iconColor: "text-rose-400",
      sparkColor: "#ef4444",
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
          className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/80 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
        >
          {stat.hasBeam && (
            <BorderBeam
              size={200}
              duration={10}
              colorFrom="#ef4444"
              colorTo="#f97316"
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
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                {stat.title}
              </p>
              <div className="mt-1 flex items-baseline gap-0.5 text-3xl font-bold tracking-tight text-white">
                {stat.prefix && (
                  <span className="text-xl text-zinc-400">{stat.prefix}</span>
                )}
                <NumberTicker
                  value={stat.value}
                  decimalPlaces={stat.decimalPlaces || 0}
                  className="text-white"
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {stat.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
