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
    { label: "Accuracy", value: params.accuracy, color: "text-chart-1" },
    { label: "Precision", value: params.precision, color: "text-chart-2" },
    { label: "Recall", value: params.recall, color: "text-chart-3" },
    { label: "F1 Score", value: params.f1_score, color: "text-chart-4" },
  ];

  const getRiskBarColor = (prob: number) => {
    if (prob > 0.7) return "bg-destructive";
    if (prob > 0.3) return "bg-orange-500"; // Or a semantic color if available
    return "bg-primary";
  };

  const getRiskLabel = (prob: number) => {
    if (prob > 0.7) return "High Risk";
    if (prob > 0.3) return "Trung bình";
    return "Low Risk";
  };

  const getRiskBadgeColor = (prob: number) => {
    if (prob > 0.7)
      return "bg-destructive/20 text-destructive border border-destructive/30";
    if (prob > 0.3)
      return "bg-orange-500/20 text-orange-500 border border-orange-500/30";
    return "bg-primary/20 text-primary border border-primary/30";
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
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Logistic Regression
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Predict customer churn probability using binary classification model.
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

      {/* Risk Distribution */}
      {data.summary && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "High Risk (>70%)",
              count: data.summary.high_risk_count || 0,
              dotColor: "bg-destructive",
              glowColor: "shadow-destructive/20",
              gradient: "from-destructive/20 to-destructive/5",
              borderColor: "border-destructive/30 hover:border-destructive/50",
            },
            {
              label: "Medium Risk (30-70%)",
              count: data.summary.medium_risk_count || 0,
              dotColor: "bg-orange-500",
              glowColor: "shadow-orange-500/20",
              gradient: "from-orange-500/20 to-orange-500/5",
              borderColor: "border-orange-500/30 hover:border-orange-500/50",
            },
            {
              label: "Low Risk (<30%)",
              count: data.summary.low_risk_count || 0,
              dotColor: "bg-primary",
              glowColor: "shadow-primary/20",
              gradient: "from-primary/20 to-primary/5",
              borderColor: "border-primary/30 hover:border-primary/50",
            },
          ].map((risk, idx) => (
            <motion.div
              key={risk.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
              className={`relative overflow-hidden rounded-xl border bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 ${risk.borderColor}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${risk.gradient} opacity-50`}
              />
              <div className="relative z-10 flex items-center gap-4">
                <div
                  className={`h-4 w-4 rounded-full ${risk.dotColor} shadow-lg ${risk.glowColor}`}
                />
                <div>
                  <p className="text-sm text-muted-foreground">{risk.label}</p>
                  <div className="text-3xl font-bold text-foreground">
                    <NumberTicker value={risk.count} className="text-foreground" />
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
          className="rounded-xl border bg-card/50 p-6 backdrop-blur-xl"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
            Model Coefficients
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
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
                    <span className="w-28 text-sm capitalize text-muted-foreground">
                      {feature.replace("_", " ")}
                    </span>
                    <div className="relative flex-1 h-6 rounded-full bg-muted overflow-hidden">
                      {/* Center line */}
                      <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
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
                            ? "left-1/2 bg-gradient-to-r from-destructive/80 to-destructive"
                            : "right-1/2 bg-gradient-to-l from-primary/80 to-primary"
                        }`}
                      />
                    </div>
                    <span className="w-20 text-right font-mono text-sm text-foreground/80">
                      {coef.toFixed(4)}
                    </span>
                  </div>
                );
              })}
            {params.intercept !== undefined && (
              <div className="flex items-center gap-4 border-t pt-4">
                <span className="w-28 text-sm text-muted-foreground">Intercept</span>
                <span className="font-mono text-sm text-foreground/80">
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
                  Churn Probability
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Risk Level
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
                  <td className="px-4 py-3 text-foreground/80">{row.Tenure}</td>
                  <td className="px-4 py-3 text-foreground/80">{row.SatisfactionScore}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${getRiskBarColor(row.Churn_Probability || 0)}`}
                          style={{
                            width: `${(row.Churn_Probability || 0) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-foreground/80">
                        {row.Churn_Probability
                          ? `${(row.Churn_Probability * 100).toFixed(0)}%`
                          : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getRiskBadgeColor(row.Churn_Probability || 0)}`}
                    >
                      {getRiskLabel(row.Churn_Probability || 0)}
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
