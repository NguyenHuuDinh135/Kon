"use client";

import { useState } from "react";
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
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  "Decision Tree": "var(--color-chart-1)",
  "Logistic Regression": "var(--color-chart-2)",
  "KMeans Clustering": "var(--color-chart-3)",
};

const PAGE_SIZE = 20;

export function CompareContent({ data, metrics }: CompareContentProps) {
  const [page, setPage] = useState(0);
  const customers = data.customers || [];
  const totalPages = Math.ceil(customers.length / PAGE_SIZE);
  const paginatedCustomers = customers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
    if (prob > 0.7) return "bg-destructive";
    if (prob > 0.3) return "bg-warning"; // Assuming warning is available or use chart-4/5
    return "bg-primary";
  };

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Header */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Compare 3 Models
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Side-by-side comparison of Decision Tree, K-Means Clustering, and
          Logistic Regression results.
        </motion.p>
      </div>

      {/* Radar Chart - Performance Comparison */}
      {metrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card/50 p-6 backdrop-blur-xl"
        >
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid
                  stroke="var(--color-border)"
                  gridType="polygon"
                />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                  axisLine={false}
                />
                {metrics.map((m: any) => (
                  <Radar
                    key={m.model_name}
                    name={m.model_name}
                    dataKey={m.model_name}
                    stroke={modelColors[m.model_name] || "var(--color-muted-foreground)"}
                    fill={modelColors[m.model_name] || "var(--color-muted-foreground)"}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend
                  wrapperStyle={{ color: "var(--color-muted-foreground)", fontSize: 12 }}
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
        className="overflow-hidden rounded-xl border bg-card/50 backdrop-blur-xl"
      >
        <div className="border-b p-4">
          <h3 className="text-sm font-semibold text-foreground/80">
            Performance Metrics
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Accuracy
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Precision
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Recall
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  F1 Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {metrics.map((m: any) => (
                <tr
                  key={m.model_name}
                  className="transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            modelColors[m.model_name] || "var(--color-muted-foreground)",
                        }}
                      />
                      <span className="font-medium text-foreground">
                        {m.model_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground/80">
                    {m.accuracy
                      ? `${(m.accuracy * 100).toFixed(1)}%`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-foreground/80">
                    {m.precision_score
                      ? `${(m.precision_score * 100).toFixed(1)}%`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-foreground/80">
                    {m.recall
                      ? `${(m.recall * 100).toFixed(1)}%`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-foreground/80">
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
        className="overflow-hidden rounded-xl border bg-card/50 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-sm font-semibold text-foreground/80">
            Side-by-side Predictions ({data.total || customers.length} customers)
          </h3>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tenure
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Satisfaction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Orders
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Decision Tree
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  K-Means
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Churn Prob
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paginatedCustomers.map((row: any) => (
                <tr
                  key={row.CustomerID}
                  className="transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3 text-foreground/80">{row.CustomerID}</td>
                  <td className="px-4 py-3 text-foreground/80">{row.Tenure}</td>
                  <td className="px-4 py-3 text-foreground/80">{row.SatisfactionScore}</td>
                  <td className="px-4 py-3 text-foreground/80">
                    {row.OrderCount}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full border border-primary/30 bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {row.DT_Label || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full border border-chart-3/30 bg-chart-3/20 px-2.5 py-0.5 text-xs font-medium text-chart-3">
                      {row.cluster_label ||
                        clusterNames[row.Cluster] ||
                        "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.Churn_Probability != null ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-14 overflow-hidden rounded-full bg-muted/50">
                          <div
                            className={`h-full rounded-full ${getRiskBarColor(row.Churn_Probability)}`}
                            style={{
                              width: `${row.Churn_Probability * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-foreground/80">
                          {(row.Churn_Probability * 100).toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
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
