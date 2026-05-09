import { fetchLogisticRegressionPredictions, fetchModelMetrics } from "@/lib/api";
import { LogisticRegressionContent } from "@/components/predictions/logistic-regression-content";

export default async function LogisticRegressionPage() {
  let data: any = { predictions: [], summary: {} };
  let metrics: any[] = [];
  try {
    [data, metrics] = await Promise.all([
      fetchLogisticRegressionPredictions(),
      fetchModelMetrics()
    ]);
  } catch {}

  const lrMetric = metrics.find((m: any) => m.model_name === "Logistic Regression");
  const params = lrMetric?.parameters ? JSON.parse(lrMetric.parameters) : {};

  return (
    <LogisticRegressionContent
      data={data}
      params={params}
    />
  );
}
