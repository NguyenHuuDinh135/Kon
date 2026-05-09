"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BrainCircuit, TrendingDown, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { fetchAIInsights } from "@/lib/api";

interface AIInsight {
  observations_summary: {
    revenue_change: number | null;
    high_risk_customers: number | null;
    avg_satisfaction: number | null;
  };
  insights_count: number;
  actions_taken: string[];
  created_at: string | null;
}

export function AIInsightsCard() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIInsights()
      .then((data) => setInsights(data.cycles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latest = insights[0];

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl p-6 animate-pulse">
        <div className="h-4 w-32 bg-zinc-800 rounded mb-4" />
        <div className="h-3 w-full bg-zinc-800 rounded mb-2" />
        <div className="h-3 w-2/3 bg-zinc-800 rounded" />
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="h-5 w-5 text-teal-400" />
          <h3 className="font-semibold text-sm">AI Insights</h3>
        </div>
        <p className="text-sm text-zinc-400">No autonomous cycles have run yet. Insights will appear after the first ML training cycle.</p>
      </div>
    );
  }

  const revChange = latest.observations_summary?.revenue_change;
  const highRisk = latest.observations_summary?.high_risk_customers;
  const satisfaction = latest.observations_summary?.avg_satisfaction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 p-1.5">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-sm">AI Autonomous Insights</h3>
        </div>
        <span className="text-xs text-zinc-500">
          {latest.created_at ? new Date(latest.created_at).toLocaleString() : "Recent"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-zinc-800/30 p-3 text-center">
          {revChange !== null && revChange !== undefined ? (
            <>
              {revChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400 mx-auto mb-1" />
              )}
              <p className={`text-sm font-bold ${revChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {revChange > 0 ? "+" : ""}{revChange}%
              </p>
              <p className="text-xs text-zinc-500">Revenue</p>
            </>
          ) : (
            <p className="text-xs text-zinc-500">No data</p>
          )}
        </div>

        <div className="rounded-lg bg-zinc-800/30 p-3 text-center">
          <AlertTriangle className={`h-4 w-4 mx-auto mb-1 ${(highRisk || 0) > 100 ? "text-red-400" : "text-amber-400"}`} />
          <p className="text-sm font-bold">{highRisk || 0}</p>
          <p className="text-xs text-zinc-500">At Risk</p>
        </div>

        <div className="rounded-lg bg-zinc-800/30 p-3 text-center">
          <p className="text-sm font-bold text-teal-400">{satisfaction || "N/A"}/5</p>
          <p className="text-xs text-zinc-500 mt-1">Satisfaction</p>
        </div>
      </div>

      {latest.actions_taken && latest.actions_taken.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-400 uppercase tracking-wider">Actions Taken</p>
          {latest.actions_taken.slice(0, 3).map((action, i) => (
            <p key={i} className="text-xs text-zinc-300 flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-teal-400" />
              {action}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
