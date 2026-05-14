import { fetchDecisionTreePredictions, fetchModelMetrics } from "@/lib/api";
import { DecisionTreeContent } from "@/components/predictions/decision-tree-content";

export default async function DecisionTreePage() {
  let data: any = { predictions: [], summary: {} };
  let metrics: any[] = [];
  try {
    [data, metrics] = await Promise.all([
      fetchDecisionTreePredictions(),
      fetchModelMetrics()
    ]);
  } catch {}

  const dtMetric = metrics.find((m: any) => m.model_name === "Decision Tree");
  const params = typeof dtMetric?.parameters === 'string' 
    ? JSON.parse(dtMetric.parameters) 
    : (dtMetric?.parameters || {});

  return (
    <DecisionTreeContent
      data={data}
      params={params}
    />
  );
}
