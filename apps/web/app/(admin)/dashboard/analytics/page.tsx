import { fetchCLVBySegment, fetchGeographicStats, fetchRFMScores, fetchForecast } from "@/lib/api";
import { PageHero } from "@/components/shared/page-hero";
import { RevenueForecastChart } from "@/components/analytics/revenue-forecast-chart";
import { RFMDistributionChart } from "@/components/analytics/rfm-distribution-chart";
import { CLVBySegmentChart } from "@/components/analytics/clv-by-segment-chart";
import { GeographicTable } from "@/components/analytics/geographic-table";

export default async function AnalyticsPage() {
  let clvBySegment: any[] = [];
  let geoStats: any[] = [];
  let rfmData: any[] = [];
  let forecastData: any[] = [];

  try {
    [clvBySegment, geoStats, rfmData, forecastData] = await Promise.all([
      fetchCLVBySegment().catch(() => []),
      fetchGeographicStats().catch(() => []),
      fetchRFMScores().catch(() => []),
      fetchForecast().catch(() => []),
    ]);
  } catch {
    // Graceful fallback if APIs fail
  }

  return (
    <div className="min-h-screen space-y-8 pb-12">
      <PageHero
        subtitle="Advanced Analytics"
        title="Business Intelligence"
        description="Multi-dimensional data exploration, customer lifetime value, and ML-powered forecasting."
      />

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Revenue Forecast - Large */}
        <div className="lg:col-span-7">
          <RevenueForecastChart data={forecastData} />
        </div>
        {/* RFM Score Distribution */}
        <div className="lg:col-span-5">
          <RFMDistributionChart data={rfmData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* CLV By Segment */}
        <div className="lg:col-span-5">
          <CLVBySegmentChart data={clvBySegment} />
        </div>
        {/* Geographic Distribution */}
        <div className="lg:col-span-7">
          <GeographicTable data={geoStats} />
        </div>
      </div>
    </div>
  );
}
