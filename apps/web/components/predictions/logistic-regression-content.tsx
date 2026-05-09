"use client";

import { motion } from "motion/react";
import { NumberTicker } from "@workspace/ui/components/number-ticker";

interface LogisticRegressionContentProps {
  data: {
    predictions: any[];
    summary: {
      high_risk_count?: number;
      medium_risk_count?: number;
      low_risk_count?: number;
    };
    total?: number;
  };
  params: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    coefficients?: Record<string, number>;
    intercept?: number;
  };
}

export function LogisticRegressionContent({
  data,
  params,
}: LogisticRegressionContentProps) {
  const metricsData = [
    { label: "Accuracy", value: params.accuracy, color: "text-emerald-400" },
    { label: "Precision", value: params.precision, color: "text-teal-400" },
    { label: "Recall", value: params.recall, color: "text-cyan-400" },
    { label: "F1 Score", value: params.f1_score, color: "text-blue-400" },
  ];

  const getRiskBarColor = (prob: number) => {
    if (prob > 0.7) return "bg-red-500";
    if (prob > 0.3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getRiskLabel = (prob: number) => {
    if (prob > 0.7) return "High Risk";
    if (prob > 0.3) return "Medium";
    return "Low Risk";
  };

  const getRiskBadgeColor = (prob: number) => {
    if (prob > 0.7)
      return "bg-red-500/20 text-red-300 border border-red-500/30";
    if (prob > 0.3)
      return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
    return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
  };

  // Calculate max absolute coefficient for scaling
  const maxAbsCoef = params.coefficients
    ? Math.max(
        ...Object.values(params.coefficients).map((c) => Math.abs(c))
      )
    : 1;

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Header */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-white"
        >
          Logistic Regression
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-400"
        >
          Du doan xac suat roi bo (churn) khach hang bang mo hinh phan loai nhi
          phan.
        </motion.p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {metricsData.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5 backdrop-blur-xl transition-all duration-300 hover:border-teal-500/30 hover:bg-zinc-900/80"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {m.label}
            </p>
            <div className={`mt-2 text-3xl font-bold ${m.color}`}>
              {m.value ? (
                <>
                  <NumberTicker
                    value={parseFloat((m.value * 100).toFixed(1))}
                    decimalPlaces={1}
                    className={m.color}
                  />
                  <span className="text-lg text-zinc-500">%</span>
                </>
              ) : (
                <span className="text-zinc-600">N/A</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Risk Distribution */}
      {data.summary && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "High Risk (>70%)",
              count: data.summary.high_risk_count || 0,
              dotColor: "bg-red-500",
              glowColor: "shadow-red-500/20",
              gradient: "from-red-500/20 to-rose-500/5",
              borderColor: "border-red-500/30 hover:border-red-400/50",
            },
            {
              label: "Medium Risk (30-70%)",
              count: data.summary.medium_risk_count || 0,
              dotColor: "bg-amber-500",
              glowColor: "shadow-amber-500/20",
              gradient: "from-amber-500/20 to-yellow-500/5",
              borderColor: "border-amber-500/30 hover:border-amber-400/50",
            },
            {
              label: "Low Risk (<30%)",
              count: data.summary.low_risk_count || 0,
              dotColor: "bg-emerald-500",
              glowColor: "shadow-emerald-500/20",
              gradient: "from-emerald-500/20 to-teal-500/5",
              borderColor: "border-emerald-500/30 hover:border-emerald-400/50",
            },
          ].map((risk, idx) => (
            <motion.div
              key={risk.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
              className={`relative overflow-hidden rounded-xl border bg-zinc-950/60 p-6 backdrop-blur-xl transition-all duration-300 ${risk.borderColor}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${risk.gradient} opacity-50`}
              />
              <div className="relative z-10 flex items-center gap-4">
                <div
                  className={`h-4 w-4 rounded-full ${risk.dotColor} shadow-lg ${risk.glowColor}`}
                />
                <div>
                  <p className="text-sm text-zinc-400">{risk.label}</p>
                  <div className="text-3xl font-bold text-white">
                    <NumberTicker value={risk.count} className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Coefficients - Bi-directional bars */}
      {params.coefficients && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Model Coefficients
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Red = increases churn probability | Green = decreases churn
            probability
          </p>
          <div className="mt-5 space-y-4">
            {Object.entries(params.coefficients)
              .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
              .map(([feature, coef], idx) => {
                const pct = (Math.abs(coef) / maxAbsCoef) * 45;
                return (
                  <div key={feature} className="flex items-center gap-4">
                    <span className="w-28 text-sm capitalize text-zinc-400">
                      {feature.replace("_", " ")}
                    </span>
                    <div className="relative flex-1 h-6 rounded-full bg-zinc-800/50 overflow-hidden">
                      {/* Center line */}
                      <div className="absolute left-1/2 top-0 h-full w-px bg-zinc-600/50" />
                      {/* Bar */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.8,
                          delay: 0.5 + idx * 0.1,
                          ease: "easeOut",
                        }}
                        className={`absolute top-0 h-full rounded-full ${
                          coef > 0
                            ? "left-1/2 bg-gradient-to-r from-red-500/80 to-red-400"
                            : "right-1/2 bg-gradient-to-l from-emerald-500/80 to-emerald-400"
                        }`}
                      />
                    </div>
                    <span className="w-20 text-right font-mono text-sm text-zinc-300">
                      {coef.toFixed(4)}
                    </span>
                  </div>
                );
              })}
            {params.intercept !== undefined && (
              <div className="flex items-center gap-4 border-t border-zinc-800/50 pt-4">
                <span className="w-28 text-sm text-zinc-400">Intercept</span>
                <span className="font-mono text-sm text-zinc-300">
                  {params.intercept}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Predictions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
      >
        <div className="border-b border-zinc-800/50 p-4">
          <h3 className="text-sm font-semibold text-zinc-300">
            Chi tiet Du doan Churn ({data.total || 0} khach hang)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800/50 bg-zinc-900/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Gioi tinh
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Tuoi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Thu nhap (k$)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Xac suat Churn
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Muc rui ro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {(data.predictions || []).slice(0, 50).map((row: any) => (
                <tr
                  key={row.CustomerID}
                  className="transition-colors hover:bg-zinc-800/20"
                >
                  <td className="px-4 py-3 text-zinc-300">{row.CustomerID}</td>
                  <td className="px-4 py-3 text-zinc-300">{row.Gender}</td>
                  <td className="px-4 py-3 text-zinc-300">{row.Age}</td>
                  <td className="px-4 py-3 text-zinc-300">{row.income}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-800/50">
                        <div
                          className={`h-full rounded-full ${getRiskBarColor(row.churn_probability || 0)}`}
                          style={{
                            width: `${(row.churn_probability || 0) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-zinc-300">
                        {row.churn_probability
                          ? `${(row.churn_probability * 100).toFixed(0)}%`
                          : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getRiskBadgeColor(row.churn_probability || 0)}`}
                    >
                      {getRiskLabel(row.churn_probability || 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
