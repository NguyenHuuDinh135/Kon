"use client";

import { useEffect, useState } from "react";
import { fetchAIInsights } from "@/lib/api";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, UserMinus, Star } from "lucide-react";

export function AIInsightsCard() {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAIInsights();
        if (data.cycles && data.cycles.length > 0) {
          setInsight(data.cycles[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card/50 backdrop-blur-xl p-6 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-4" />
        <div className="h-3 w-full bg-muted rounded mb-2" />
        <div className="h-3 w-2/3 bg-muted rounded" />
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="rounded-xl border bg-card/50 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Phân tích tự động</h3>
        </div>
        <p className="text-sm text-muted-foreground">Chưa có chu kỳ tự động nào chạy. Kết quả sẽ xuất hiện sau lần huấn luyện ML đầu tiên.</p>
      </div>
    );
  }

  const obs = insight.observations || {};
  const plans = insight.plans || [];

  return (
    <div
      className="rounded-xl border bg-card/50 backdrop-blur-xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Phân tích mới nhất</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {insight.created_at ? new Date(insight.created_at).toLocaleTimeString() : "Vừa xong"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1.5 text-chart-1" />
          {obs.revenue_trend ? (
            <>
              <p className="text-sm font-bold">{obs.revenue_trend > 0 ? "+" : ""}{obs.revenue_trend}%</p>
              <p className="text-[10px] text-muted-foreground">Doanh thu</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No data</p>
          )}
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <UserMinus className="h-4 w-4 mx-auto mb-1.5 text-destructive" />
          <p className="text-sm font-bold">{obs.churn_risk_customers || 0}</p>
          <p className="text-xs text-muted-foreground">Có nguy cơ</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <Star className="h-4 w-4 mx-auto mb-1.5 text-chart-3" />
          <p className="text-sm font-bold">{obs.avg_satisfaction?.toFixed(1) || "N/A"}</p>
          <p className="text-xs text-muted-foreground mt-1">Hài lòng</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Hành động đã thực hiện</p>
        </div>
        <div className="space-y-1.5">
          {plans.slice(0, 3).map((p: string, i: number) => (
            <p key={i} className="text-xs text-foreground/80 flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
              <span className="truncate">{p}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
