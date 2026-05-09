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
import { DashboardHero } from "@/components/dashboard/dashboard-hero";

export default async function DashboardPage() {
  const [kpis, revenueData, segmentationData, topProducts] = await Promise.all([
    fetchDashboardKPIs(),
    fetchRevenueOverTime(),
    fetchSegmentationStats(),
    fetchTopProducts()
  ]);

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Hero Section with mesh gradient */}
      <DashboardHero />

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
