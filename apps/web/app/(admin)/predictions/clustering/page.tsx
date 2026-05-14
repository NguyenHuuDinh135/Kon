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
  const params = typeof kmMetric?.parameters === 'string' 
    ? JSON.parse(kmMetric.parameters) 
    : (kmMetric?.parameters || {});

  return (
    <ClusteringContent
      data={data}
      params={params}
    />
  );
}
