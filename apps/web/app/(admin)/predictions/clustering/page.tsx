import { fetchClusteringPredictions, fetchModelMetrics } from "@/lib/api";
import { ClusteringContent } from "@/components/predictions/clustering-content";

export default async function ClusteringPage() {
  let data: any = { predictions: [], clusters: [] };
  let metrics: any[] = [];
  try {
    [data, metrics] = await Promise.all([
      fetchClusteringPredictions(),
      fetchModelMetrics()
    ]);
  } catch {}

  const kmMetric = metrics.find((m: any) => m.model_name === "KMeans Clustering");
  const params = kmMetric?.parameters ? JSON.parse(kmMetric.parameters) : {};

  return (
    <ClusteringContent
      data={data}
      params={params}
    />
  );
}
