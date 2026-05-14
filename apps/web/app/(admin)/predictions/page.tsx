import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  BrainCircuit,
  Target,
  TrendingUp,
  BarChart3,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { fetchModelMetrics } from "@/lib/api";

function formatMetric(value: number | undefined, label: string, suffix = ""): string {
  if (value == null) return "Not trained";
  return `${label}: ${(value * (suffix === "%" ? 100 : 1)).toFixed(suffix === "%" ? 1 : 2)}${suffix}`;
}

export default async function PredictionsPage() {
  let metricsArray: any[] = [];
  try {
    metricsArray = await fetchModelMetrics();
  } catch {
    metricsArray = [];
  }

  const dtMetric = metricsArray.find((m: any) => m.model_name === "Decision Tree");
  const kmeansMetric = metricsArray.find((m: any) => m.model_name === "KMeans Clustering");
  const lrMetric = metricsArray.find((m: any) => m.model_name === "Logistic Regression");

  const dtParams = typeof dtMetric?.parameters === "string" ? JSON.parse(dtMetric.parameters) : (dtMetric?.parameters || {});
  const kmeansParams = typeof kmeansMetric?.parameters === "string" ? JSON.parse(kmeansMetric.parameters) : (kmeansMetric?.parameters || {});
  const lrParams = typeof lrMetric?.parameters === "string" ? JSON.parse(lrMetric.parameters) : (lrMetric?.parameters || {});

  const models = [
    {
      title: "Decision Tree",
      description:
        "Multi-class classifier that identifies customer engagement levels automatically.",
      icon: BrainCircuit,
      href: "/predictions/decision-tree",
      metric: dtMetric?.accuracy != null
        ? formatMetric(dtMetric.accuracy, "Accuracy", "%")
        : "Not trained",
    },
    {
      title: "K-Means Clustering",
      description:
        "Unsupervised RFM segmentation identifying VIP, Loyal, At Risk, and New groups.",
      icon: Target,
      href: "/predictions/clustering",
      metric: kmeansParams?.silhouette_score != null
        ? formatMetric(kmeansParams.silhouette_score, "Silhouette")
        : "Not trained",
    },
    {
      title: "Logistic Regression",
      description:
        "Binary churn probability prediction for each customer.",
      icon: TrendingUp,
      href: "/predictions/logistic-regression",
      metric: lrParams?.roc_auc != null
        ? formatMetric(lrParams.roc_auc, "ROC-AUC")
        : "Not trained",
    },
    {
      title: "Model Comparison",
      description:
        "Side-by-side performance comparison across all trained models.",
      icon: BarChart3,
      href: "/predictions/compare",
      metric: metricsArray.length > 0 ? "Active" : "No data",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="relative overflow-hidden border bg-card">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute -right-20 top-10 h-60 w-60 rounded-full bg-primary/5 blur-[80px]" />
        </div>
        <CardContent className="relative z-10 p-8 md:p-12">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-4 border-primary/20 bg-primary/5 text-primary"
            >
              <ShieldCheck className="mr-1.5 h-3 w-3" />
              ML Pipeline Verified
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Predictive Intelligence
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Advanced machine learning analytics from Olist and UCI retail
              datasets. Models process 500k+ transactions to predict business
              outcomes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Model Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {models.map((model) => (
          <Link key={model.title} href={model.href}>
            <Card className="group h-full cursor-pointer overflow-hidden border-border/60 transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
              <CardContent className="flex h-full flex-col p-8">
                <div className="flex items-start justify-between">
                  <div className="rounded-xl border border-border/60 bg-muted p-3 transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                    <model.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs font-mono"
                  >
                    {model.metric}
                  </Badge>
                </div>

                <div className="mt-8 flex-1">
                  <h3 className="text-xl font-bold text-foreground">
                    {model.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {model.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-sm font-medium text-primary">
                  View Details
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
