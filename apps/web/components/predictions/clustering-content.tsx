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
  VIP: "from-chart-1/30 to-chart-1/10",
  Loyal: "from-chart-2/30 to-chart-2/10",
  "At Risk": "from-chart-3/30 to-chart-3/10",
  Regular: "from-chart-4/30 to-chart-4/10",
  New: "from-chart-5/30 to-chart-5/10",
};

const clusterBorderColors: Record<string, string> = {
  VIP: "border-chart-1/40 hover:border-chart-1/60",
  Loyal: "border-chart-2/40 hover:border-chart-2/60",
  "At Risk": "border-chart-3/40 hover:border-chart-3/60",
  Regular: "border-chart-4/40 hover:border-chart-4/60",
  New: "border-chart-5/40 hover:border-chart-5/60",
};

const clusterBadge: Record<string, string> = {
  VIP: "bg-chart-1/20 text-chart-1 border border-chart-1/30",
  Loyal: "bg-chart-2/20 text-chart-2 border border-chart-2/30",
  "At Risk": "bg-chart-3/20 text-chart-3 border border-chart-3/30",
  Regular: "bg-chart-4/20 text-chart-4 border border-chart-4/30",
  New: "bg-chart-5/20 text-chart-5 border border-chart-5/30",
};

const scatterColors: Record<string, string> = {
  VIP: "var(--chart-1)",
  Loyal: "var(--chart-2)",
  "At Risk": "var(--chart-3)",
  Regular: "var(--chart-4)",
  New: "var(--chart-5)",
};

export function ClusteringContent({ data, params }: ClusteringContentProps) {
  // Group predictions by cluster for the scatter chart
  const clusterGroups: Record<string, any[]> = {};
  (data.predictions || []).forEach((row: any) => {
    const label = row.cluster_label || "Unknown";
    if (!clusterGroups[label]) clusterGroups[label] = [];
    clusterGroups[label].push({
      recency: row.recency,
      monetary: row.monetary,
    });
  });

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Header */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          K-Means Clustering
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Customer segmentation into 5 groups based on RFM analysis (Recency, Frequency, Monetary).
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
            color: "text-primary",
          },
          {
            label: "Inertia",
            value: params.inertia ? Math.round(params.inertia) : null,
            suffix: "",
            color: "text-chart-1",
          },
          {
            label: "Clusters (K)",
            value: params.n_clusters || 5,
            suffix: "",
            color: "text-chart-2",
          },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
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
                    <span className="text-lg text-muted-foreground/60">{m.suffix}</span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground/40">N/A</span>
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
            className={`relative overflow-hidden rounded-xl border bg-card/60 p-5 backdrop-blur-xl transition-all duration-300 ${clusterBorderColors[cluster.label] || "border-border"}`}
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${clusterGradients[cluster.label] || "from-muted/10 to-muted/5"} opacity-50`}
            />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${clusterBadge[cluster.label] || "bg-muted text-muted-foreground"}`}
                >
                  {cluster.label}
                </span>
                <span className="text-2xl font-bold text-foreground">
                  <NumberTicker value={cluster.count} className="text-foreground" />
                </span>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>
                  Avg Recency:{" "}
                  <span className="font-medium text-foreground">
                    {cluster.avg_recency} days
                  </span>
                </p>
                <p>
                  Avg Frequency:{" "}
                  <span className="font-medium text-foreground">
                    {cluster.avg_frequency} orders
                  </span>
                </p>
                <p>
                  Avg Monetary:{" "}
                  <span className="font-medium text-foreground">
                    ${cluster.avg_monetary?.toLocaleString()}
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
          className="rounded-xl border border-border bg-card p-6 backdrop-blur-xl"
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/90">
            Recency vs Monetary Value
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="recency"
                  name="Recency"
                  unit=" days"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)", opacity: 0.5 }}
                />
                <YAxis
                  dataKey="monetary"
                  name="Monetary"
                  unit="$"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)", opacity: 0.5 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "var(--muted-foreground)", fontSize: 12 }}
                />
                {Object.entries(clusterGroups).map(([label, points]) => (
                  <Scatter
                    key={label}
                    name={label}
                    data={points}
                    fill={scatterColors[label] || "var(--muted-foreground)"}
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
        className="overflow-hidden rounded-xl border border-border bg-card backdrop-blur-xl"
      >
        <div className="border-b border-border p-4">
          <h3 className="text-sm font-semibold text-foreground/90">
            Cluster Details ({data.total || 0} customers)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Recency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Frequency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Monetary
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Cluster
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {(data.predictions || []).slice(0, 50).map((row: any) => (
                <tr
                  key={row.CustomerID}
                  className="transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3 text-foreground/80">{row.CustomerID}</td>
                  <td className="px-4 py-3 text-foreground/80">{row.recency}</td>
                  <td className="px-4 py-3 text-foreground/80">{row.frequency}</td>
                  <td className="px-4 py-3 text-foreground/80">
                    ${row.monetary?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${clusterBadge[row.cluster_label] || "bg-muted text-muted-foreground"}`}
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
