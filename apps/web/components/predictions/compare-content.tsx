"use client";

import { motion } from "motion/react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CompareContentProps {
  data: {
    customers: any[];
    total?: number;
  };
  metrics: any[];
}

const clusterNames: Record<number, string> = {
  0: "VIP",
  1: "Loyal",
  2: "At Risk",
  3: "Casual",
};

const modelColors: Record<string, string> = {
  "Decision Tree": "#14b8a6",
  "Logistic Regression": "#f97316",
  "KMeans Clustering": "#a855f7",
};

export function CompareContent({ data, metrics }: CompareContentProps) {
  // Build radar chart data from metrics
  const radarData = (() => {
    const metricNames = ["accuracy", "precision_score", "recall", "f1_score"];
    const displayNames: Record<string, string> = {
      accuracy: "Accuracy",
      precision_score: "Precision",
      recall: "Recall",
      f1_score: "F1 Score",
    };

    return metricNames.map((metricKey) => {
      const point: any = { metric: displayNames[metricKey] || metricKey };
      metrics.forEach((m: any) => {
        const val = m[metricKey] ?? m.accuracy;
        point[m.model_name] = val ? parseFloat((val * 100).toFixed(1)) : 0;
      });
      return point;
    });
  })();

  const getRiskBarColor = (prob: number) => {
    if (prob > 0.7) return "bg-red-500";
    if (prob > 0.3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Header */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-white"
        >
          So sanh 3 Mo hinh
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-400"
        >
          Ket qua du doan song song tu Decision Tree, K-Means Clustering, va
          Logistic Regression.
        </motion.p>
      </div>

      {/* Radar Chart - Performance Comparison */}
      {metrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Performance Comparison
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid
                  stroke="rgba(63,63,70,0.4)"
                  gridType="polygon"
                />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={false}
                />
                {metrics.map((m: any) => (
                  <Radar
                    key={m.model_name}
                    name={m.model_name}
                    dataKey={m.model_name}
                    stroke={modelColors[m.model_name] || "#6b7280"}
                    fill={modelColors[m.model_name] || "#6b7280"}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend
                  wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Performance Metrics Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
      >
        <div className="border-b border-zinc-800/50 p-4">
          <h3 className="text-sm font-semibold text-zinc-300">
            Performance Metrics
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800/50 bg-zinc-900/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Accuracy
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Precision
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Recall
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  F1 Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {metrics.map((m: any) => (
                <tr
                  key={m.model_name}
                  className="transition-colors hover:bg-zinc-800/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            modelColors[m.model_name] || "#6b7280",
                        }}
                      />
                      <span className="font-medium text-zinc-200">
                        {m.model_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {m.accuracy
                      ? `${(m.accuracy * 100).toFixed(1)}%`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {m.precision_score
                      ? `${(m.precision_score * 100).toFixed(1)}%`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {m.recall
                      ? `${(m.recall * 100).toFixed(1)}%`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {m.f1_score
                      ? `${(m.f1_score * 100).toFixed(1)}%`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Side-by-side Customer Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
      >
        <div className="border-b border-zinc-800/50 p-4">
          <h3 className="text-sm font-semibold text-zinc-300">
            Du doan song song ({data.total || 0} khach hang)
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
                  Tuoi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Thu nhap
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Chi tieu
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Decision Tree
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  K-Means
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Churn Prob
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {(data.customers || []).slice(0, 50).map((row: any) => (
                <tr
                  key={row.CustomerID}
                  className="transition-colors hover:bg-zinc-800/20"
                >
                  <td className="px-4 py-3 text-zinc-300">{row.CustomerID}</td>
                  <td className="px-4 py-3 text-zinc-300">{row.Age}</td>
                  <td className="px-4 py-3 text-zinc-300">{row.income}k$</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {row.spending_score}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                      {row.DT_Label || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full border border-violet-500/30 bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                      {row.cluster_label ||
                        clusterNames[row.Cluster] ||
                        "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.Churn_Probability != null ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-14 overflow-hidden rounded-full bg-zinc-800/50">
                          <div
                            className={`h-full rounded-full ${getRiskBarColor(row.Churn_Probability)}`}
                            style={{
                              width: `${row.Churn_Probability * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-zinc-300">
                          {(row.Churn_Probability * 100).toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
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
