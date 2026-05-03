import { Suspense } from "react";
import { 
  fetchDashboardKPIs, 
  fetchRevenueOverTime, 
  fetchSegmentationStats, 
  fetchTopProducts 
} from "@/lib/api";
import { KPIStats } from "@/components/dashboard/kpi-stats";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { SegmentationChart } from "@/components/dashboard/segmentation-chart";
import { TopProducts } from "@/components/dashboard/top-products";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default async function DashboardPage() {
  const [kpis, revenueData, segmentationData, topProducts] = await Promise.all([
    fetchDashboardKPIs(),
    fetchRevenueOverTime(),
    fetchSegmentationStats(),
    fetchTopProducts()
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Autonomous intelligence and real-time ERP analytics.
        </p>
      </div>

      <KPIStats data={kpis} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RevenueChart data={revenueData} />
        </div>
        <div className="col-span-3">
          <SegmentationChart data={segmentationData} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <TopProducts data={topProducts} />
        </div>
        <div className="col-span-3">
          <div className="bg-card rounded-xl border p-6 flex flex-col justify-center items-center text-center space-y-4">
            <h3 className="font-semibold text-lg">AI Ready for Action</h3>
            <p className="text-sm text-muted-foreground">
              Our autonomous agent is monitoring 110 churn alerts and suggesting 91 personalized recommendations.
            </p>
            <a href="/dashboard/agent" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Open AI Agent
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
