"use client";

import { motion } from "motion/react";
import { NumberTicker } from "@workspace/ui/components/number-ticker";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ClusteringContentProps {
  data: {
    predictions: any[];
    clusters: any[];
    total?: number;
  };
  params: {
    silhouette_score?: number;
    inertia?: number;
    n_clusters?: number;
  };
}

const clusterGradients: Record<string, string> = {
  VIP: "from-amber-500/30 to-orange-500/10",
  Loyal: "from-emerald-500/30 to-green-500/10",
  "At Risk": "from-red-500/30 to-rose-500/10",
  Casual: "from-blue-500/30 to-indigo-500/10",
};

const clusterBorderColors: Record<string, string> = {
  VIP: "border-amber-500/40 hover:border-amber-400/60",
  Loyal: "border-emerald-500/40 hover:border-emerald-400/60",
  "At Risk": "border-red-500/40 hover:border-red-400/60",
  Casual: "border-blue-500/40 hover:border-blue-400/60",
};

const clusterBadge: Record<string, string> = {
  VIP: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  Loyal: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  "At Risk": "bg-red-500/20 text-red-300 border border-red-500/30",
  Casual: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
};

const scatterColors: Record<string, string> = {
  VIP: "#f59e0b",
  Loyal: "#10b981",
  "At Risk": "#ef4444",
  Casual: "#3b82f6",
};

export function ClusteringContent({ data, params }: ClusteringContentProps) {
  // Group predictions by cluster for the scatter chart
  const clusterGroups: Record<string, any[]> = {};
  (data.predictions || []).forEach((row: any) => {
    const label = row.cluster_label || "Unknown";
    if (!clusterGroups[label]) clusterGroups[label] = [];
    clusterGroups[label].push({
      income: row.income,
      spending_score: row.spending_score,
    });
  });

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Header */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-white"
        >
          K-Means Clustering
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-400"
        >
          Phan khuc khach hang thanh 4 nhom dua tren thu nhap hang nam va diem chi tieu.
        </motion.p>
      </div>

      {/* Model Quality Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Silhouette Score",
            value: params.silhouette_score
              ? parseFloat((params.silhouette_score * 100).toFixed(1))
              : null,
            suffix: "%",
            color: "text-teal-400",
          },
          {
            label: "Inertia",
            value: params.inertia ? Math.round(params.inertia) : null,
            suffix: "",
            color: "text-purple-400",
          },
          {
            label: "So cum (K)",
            value: params.n_clusters || 4,
            suffix: "",
            color: "text-cyan-400",
          },
        ].map((m, i) => (
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
              {m.value !== null ? (
                <>
                  <NumberTicker
                    value={m.value}
                    decimalPlaces={m.suffix === "%" ? 1 : 0}
                    className={m.color}
                  />
                  {m.suffix && (
                    <span className="text-lg text-zinc-500">{m.suffix}</span>
                  )}
                </>
              ) : (
                <span className="text-zinc-600">N/A</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cluster Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {(data.clusters || []).map((cluster: any, idx: number) => (
          <motion.div
            key={cluster.cluster_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
            className={`relative overflow-hidden rounded-xl border bg-zinc-950/60 p-5 backdrop-blur-xl transition-all duration-300 ${clusterBorderColors[cluster.label] || "border-zinc-800/50"}`}
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${clusterGradients[cluster.label] || "from-zinc-500/10 to-zinc-800/5"} opacity-50`}
            />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${clusterBadge[cluster.label] || "bg-zinc-800 text-zinc-300"}`}
                >
                  {cluster.label}
                </span>
                <span className="text-2xl font-bold text-white">
                  <NumberTicker value={cluster.count} className="text-white" />
                </span>
              </div>
              <div className="space-y-1.5 text-sm text-zinc-400">
                <p>
                  Thu nhap TB:{" "}
                  <span className="font-medium text-zinc-200">
                    {cluster.avg_income}k$
                  </span>
                </p>
                <p>
                  Chi tieu TB:{" "}
                  <span className="font-medium text-zinc-200">
                    {cluster.avg_spending}
                  </span>
                </p>
                <p>
                  Tuoi TB:{" "}
                  <span className="font-medium text-zinc-200">
                    {cluster.avg_age}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scatter Chart: Income vs Spending by Cluster */}
      {Object.keys(clusterGroups).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Income vs Spending Score
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(63,63,70,0.3)"
                />
                <XAxis
                  dataKey="income"
                  name="Income"
                  unit="k$"
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(63,63,70,0.5)" }}
                />
                <YAxis
                  dataKey="spending_score"
                  name="Spending"
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(63,63,70,0.5)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid rgba(63,63,70,0.5)",
                    borderRadius: "8px",
                    color: "#e4e4e7",
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }}
                />
                {Object.entries(clusterGroups).map(([label, points]) => (
                  <Scatter
                    key={label}
                    name={label}
                    data={points}
                    fill={scatterColors[label] || "#6b7280"}
                    opacity={0.7}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
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
            Chi tiet phan cum ({data.total || 0} khach hang)
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
                  Cum
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
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${clusterBadge[row.cluster_label] || "bg-zinc-800 text-zinc-300"}`}
                    >
                      {row.cluster_label}
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
