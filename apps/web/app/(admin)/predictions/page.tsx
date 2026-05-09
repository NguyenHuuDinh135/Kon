import { fetchModelMetrics } from "@/lib/api";
import { PredictionsHero } from "@/components/predictions/predictions-hero";
import { ModelCards } from "@/components/predictions/model-cards";

export default async function PredictionsPage() {
  let metrics: any[] = [];
  try {
    metrics = await fetchModelMetrics();
  } catch {}

  const getMetric = (name: string) => metrics.find((m: any) => m.model_name === name);
  const dt = getMetric("Decision Tree");
  const lr = getMetric("Logistic Regression");
  const km = getMetric("KMeans Clustering");

  const kmSilhouette = km?.parameters
    ? (() => {
        try {
          const p = JSON.parse(km.parameters);
          return p.silhouette_score * 100;
        } catch {
          return null;
        }
      })()
    : null;

  const modelsData = [
    {
      title: "Decision Tree",
      subtitle: "Cay Quyet Dinh",
      description:
        "Phan loai khach hang thanh nhom chi tieu: Low, Medium, High, VIP dua tren tuoi, thu nhap va gioi tinh.",
      href: "/predictions/decision-tree",
      iconName: "git-branch" as const,
      accuracy: dt?.accuracy ? dt.accuracy * 100 : null,
      gradientFrom: "#10b981",
      gradientTo: "#14b8a6",
      accentColor: "text-emerald-400",
      accentBg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "K-Means Clustering",
      subtitle: "Gom Cum",
      description:
        "Phan cum khach hang thanh 4 nhom (VIP, Loyal, At Risk, Casual) dua tren thu nhap va diem chi tieu.",
      href: "/predictions/clustering",
      iconName: "layers" as const,
      accuracy: kmSilhouette,
      gradientFrom: "#8b5cf6",
      gradientTo: "#a855f7",
      accentColor: "text-violet-400",
      accentBg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      title: "Logistic Regression",
      subtitle: "Hoi Quy Logistic",
      description:
        "Du doan xac suat roi bo (churn) cua khach hang - phan loai nhi phan dua tren nhan khau hoc.",
      href: "/predictions/logistic-regression",
      iconName: "target" as const,
      accuracy: lr?.accuracy ? lr.accuracy * 100 : null,
      gradientFrom: "#f97316",
      gradientTo: "#ef4444",
      accentColor: "text-orange-400",
      accentBg: "bg-orange-500/10 border-orange-500/20",
    },
    {
      title: "Model Comparison",
      subtitle: "So Sanh 3 Mo Hinh",
      description:
        "So sanh song song ket qua du doan tu ca 3 mo hinh cho tung khach hang.",
      href: "/predictions/compare",
      iconName: "bar-chart" as const,
      accuracy: null,
      gradientFrom: "#3b82f6",
      gradientTo: "#6366f1",
      accentColor: "text-blue-400",
      accentBg: "bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <div className="min-h-screen space-y-8 pb-12">
      <PredictionsHero />
      <ModelCards models={modelsData} />
    </div>
  );
}
