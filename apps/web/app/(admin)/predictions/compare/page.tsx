import { fetchModelComparison, fetchModelMetrics } from "@/lib/api";
import { CompareContent } from "@/components/predictions/compare-content";

export default async function ComparePage() {
  let data: any = { customers: [] };
  let metrics: any[] = [];
  try {
    [data, metrics] = await Promise.all([
      fetchModelComparison(),
      fetchModelMetrics()
    ]);
  } catch {}

  return (
    <CompareContent
      data={data}
      metrics={metrics}
    />
  );
}
