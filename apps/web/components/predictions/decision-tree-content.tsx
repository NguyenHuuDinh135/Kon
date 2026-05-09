"use client";

import { motion } from "motion/react";
import { NumberTicker } from "@workspace/ui/components/number-ticker";

interface DecisionTreeContentProps {
  data: {
    predictions: any[];
    summary: Record<string, number>;
    total?: number;
  };
  params: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    feature_importance?: Record<string, number>;
  };
}

const categoryColors: Record<string, string> = {
  VIP: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  High: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  Medium: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  Low: "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30",
};

const categoryGlow: Record<string, string> = {
  VIP: "from-amber-500/20 to-orange-500/5",
  High: "from-emerald-500/20 to-teal-500/5",
  Medium: "from-blue-500/20 to-cyan-500/5",
  Low: "from-zinc-500/20 to-slate-500/5",
};

export function DecisionTreeContent({ data, params }: DecisionTreeContentProps) {
  const metricsData = [
    { label: "Accuracy", value: params.accuracy, color: "text-emerald-400" },
    { label: "Precision", value: params.precision, color: "text-teal-400" },
    { label: "Recall", value: params.recall, color: "text-cyan-400" },
    { label: "F1 Score", value: params.f1_score, color: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Header */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-white"
        >
          Decision Tree
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-400"
        >
          Phan loai khach hang thanh nhom chi tieu dua tren tuoi, thu nhap va gioi tinh.
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

      {/* Feature Importance */}
      {params.feature_importance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Feature Importance
          </h3>
          <div className="mt-5 space-y-4">
            {Object.entries(params.feature_importance)
              .sort(([, a], [, b]) => b - a)
              .map(([feature, importance], idx) => (
                <div key={feature} className="flex items-center gap-4">
                  <span className="w-28 text-sm capitalize text-zinc-400">
                    {feature.replace("_", " ")}
                  </span>
                  <div className="relative flex-1 h-6 rounded-full bg-zinc-800/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${importance * 100}%` }}
                      transition={{
                        duration: 1,
                        delay: 0.4 + idx * 0.15,
                        ease: "easeOut",
                      }}
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                    />
                  </div>
                  <span className="w-14 text-right text-sm font-medium text-zinc-300">
                    {(importance * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Distribution Summary */}
      {data.summary && Object.keys(data.summary).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Phan phoi Du doan
          </h3>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(data.summary).map(([category, count], idx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-950/50 p-4 text-center"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${categoryGlow[category] || "from-zinc-500/10 to-zinc-800/5"} opacity-60`}
                />
                <div className="relative z-10">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColors[category] || "bg-zinc-800 text-zinc-300"}`}
                  >
                    {category}
                  </span>
                  <div className="mt-3 text-2xl font-bold text-white">
                    <NumberTicker value={count as number} className="text-white" />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">customers</p>
                </div>
              </motion.div>
            ))}
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
            Chi tiet Du doan ({data.total || 0} khach hang)
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
                  Diem chi tieu
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Du doan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Do tin cay
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
                  <td className="px-4 py-3 text-zinc-300">
                    {row.spending_score}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[row.predicted_category] || "bg-zinc-800 text-zinc-300"}`}
                    >
                      {row.predicted_category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {row.confidence
                      ? `${(row.confidence * 100).toFixed(0)}%`
                      : "-"}
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
