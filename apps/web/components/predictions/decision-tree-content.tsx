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
  VIP: "bg-chart-3/20 text-chart-3 border border-chart-3/30",
  High: "bg-chart-1/20 text-chart-1 border border-chart-1/30",
  Medium: "bg-chart-2/20 text-chart-2 border border-chart-2/30",
  Low: "bg-muted/20 text-muted-foreground border border-border/30",
};

const categoryGlow: Record<string, string> = {
  VIP: "from-chart-3/20 to-chart-3/5",
  High: "from-chart-1/20 to-chart-1/5",
  Medium: "from-chart-2/20 to-chart-2/5",
  Low: "from-muted/20 to-muted/5",
};

export function DecisionTreeContent({ data, params }: DecisionTreeContentProps) {
  const metricsData = [
    { label: "Accuracy", value: params.accuracy, color: "text-chart-1" },
    { label: "Precision", value: params.precision, color: "text-chart-2" },
    { label: "Recall", value: params.recall, color: "text-chart-3" },
    { label: "F1 Score", value: params.f1_score, color: "text-chart-4" },
  ];

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Header */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Decision Tree
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Classify customer engagement levels based on tenure, satisfaction, and order history.
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
            className="group relative overflow-hidden rounded-xl border bg-card/50 p-5 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                  <span className="text-lg text-muted-foreground">%</span>
                </>
              ) : (
                <span className="text-muted-foreground/60">N/A</span>
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
          className="rounded-xl border bg-card/50 p-6 backdrop-blur-xl"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
            Độ quan trọng đặc trưng
          </h3>
          <div className="mt-5 space-y-4">
            {Object.entries(params.feature_importance)
              .sort(([, a], [, b]) => b - a)
              .map(([feature, importance], idx) => (
                <div key={feature} className="flex items-center gap-4">
                  <span className="w-28 text-sm capitalize text-muted-foreground">
                    {feature.replace("_", " ")}
                  </span>
                  <div className="relative flex-1 h-6 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${importance * 100}%` }}
                      transition={{
                        duration: 1,
                        delay: 0.4 + idx * 0.15,
                        ease: "easeOut",
                      }}
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/80"
                    />
                  </div>
                  <span className="w-14 text-right text-sm font-medium text-foreground/80">
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
          className="rounded-xl border bg-card/50 p-6 backdrop-blur-xl"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
            Prediction Distribution
          </h3>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(data.summary).map(([category, count], idx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="relative overflow-hidden rounded-xl border bg-card/50 p-4 text-center"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${categoryGlow[category] || "from-muted/10 to-muted/5"} opacity-60`}
                />
                <div className="relative z-10">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColors[category] || "bg-muted text-muted-foreground"}`}
                  >
                    {category}
                  </span>
                  <div className="mt-3 text-2xl font-bold text-foreground">
                    <NumberTicker value={count as number} className="text-foreground" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">customers</p>
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
        className="overflow-hidden rounded-xl border bg-card/50 backdrop-blur-xl"
      >
        <div className="border-b p-4">
          <h3 className="text-sm font-semibold text-foreground/80">
            Prediction Details ({data.total || 0} customers)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Gender
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
                  Prediction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Confidence
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
                  <td className="px-4 py-3 text-foreground/80">{row.Gender}</td>
                  <td className="px-4 py-3 text-foreground/80">{row.Age}</td>
                  <td className="px-4 py-3 text-foreground/80">{row.income}</td>
                  <td className="px-4 py-3 text-foreground/80">
                    {row.spending_score}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[row.predicted_category] || "bg-muted text-muted-foreground"}`}
                    >
                      {row.predicted_category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/80">
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
