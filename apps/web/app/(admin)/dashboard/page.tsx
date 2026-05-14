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
import { AiAgentCta } from "@/components/dashboard/ai-agent-cta";
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card";
import { PageHero } from "@/components/shared/page-hero";

export default async function DashboardPage() {
  const defaults = [
    { total_customers: 0, total_orders: 0, total_revenue: 0, churn_alerts_count: 0, avg_churn_risk: 0 },
    [],
    [],
    []
  ];
  const [kpis, revenueData, segmentationData, topProducts] = await Promise.allSettled([
    fetchDashboardKPIs(),
    fetchRevenueOverTime(),
    fetchSegmentationStats(),
    fetchTopProducts()
  ]).then(results => results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : defaults[i]
  ));

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Hero Section with mesh gradient */}
      <PageHero
        subtitle="Trung tâm điều khiển"
        title="Chào mừng trở lại."
        description="Trí tuệ tự động và phân tích ERP thời gian thực trong tầm tay bạn."
      />

      {/* KPI Stats - Glassmorphic cards with number tickers */}
      <KPIStats data={kpis} />

      {/* Main Content Grid - Asymmetric bento layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Revenue Chart - Large span */}
        <div className="lg:col-span-8">
          <RevenueChart data={revenueData} />
        </div>
        {/* Segmentation - Compact donut */}
        <div className="lg:col-span-4">
          <SegmentationChart data={segmentationData} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Top Products - Ranked list */}
        <div className="lg:col-span-7">
          <TopProducts data={topProducts} />
        </div>
        {/* AI Insights + Agent CTA */}
        <div className="lg:col-span-5 space-y-4">
          <AIInsightsCard />
          <AiAgentCta />
        </div>
      </div>
    </div>
  );
}
