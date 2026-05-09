const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAuthHeader(): Promise<Record<string, string>> {
  // Client side
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("kon_token");
    if (token) return { "Authorization": `Bearer ${token}` };
  } 
  
  // Server side
  try {
    // Dynamically import next/headers only on the server
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("kon_token")?.value;
    if (token) return { "Authorization": `Bearer ${token}` };
  } catch (e) {
    // Silently fail if cookies() is not available
  }
  
  return {};
}

export async function login(username: string, password: string) {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login failed");
  }

  const data = await res.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("kon_token", data.access_token);
    // Set cookie for middleware
    document.cookie = `kon_token=${data.access_token}; path=/; max-age=1800; samesite=lax`;
  }
  return data;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("kon_token");
    document.cookie = "kon_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const authHeader = await getAuthHeader();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    ...authHeader,
  };
  
  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return res;
  } catch (e) {
    throw e;
  }
}

export async function fetchDashboardKPIs() {
  const res = await fetchWithAuth(`${API_BASE_URL}/dashboard/kpis`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch KPIs");
  return res.json();
}

export async function fetchRevenueOverTime() {
  const res = await fetchWithAuth(`${API_BASE_URL}/dashboard/revenue-over-time`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch revenue data");
  return res.json();
}

export async function fetchSegmentationStats() {
  const res = await fetchWithAuth(`${API_BASE_URL}/dashboard/segmentation-stats`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch segmentation stats");
  return res.json();
}

export async function fetchTopProducts() {
  const res = await fetchWithAuth(`${API_BASE_URL}/dashboard/top-products`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch top products");
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetchWithAuth(`${API_BASE_URL}/alerts`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function searchBehavior(query: string) {
  const res = await fetchWithAuth(`${API_BASE_URL}/search/behavior?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function runAgent(prompt: string) {
  const res = await fetchWithAuth(`${API_BASE_URL}/agent/run?prompt=${encodeURIComponent(prompt)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error("Agent failed");
  return res.json();
}

// --- CRUD API ---

export async function fetchProducts(skip = 0, limit = 100) {
  const res = await fetchWithAuth(`${API_BASE_URL}/products?skip=${skip}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function createProduct(productData: any) {
  const res = await fetchWithAuth(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(productId: string, productData: any) {
  const res = await fetchWithAuth(`${API_BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteProduct(productId: string) {
  const res = await fetchWithAuth(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}

export async function createOrder(orderData: any) {
  const res = await fetchWithAuth(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

// --- ML PREDICTIONS API ---

export async function fetchDecisionTreePredictions() {
  const res = await fetchWithAuth(`${API_BASE_URL}/predictions/decision-tree`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch decision tree predictions");
  return res.json();
}

export async function fetchClusteringPredictions() {
  const res = await fetchWithAuth(`${API_BASE_URL}/predictions/clustering`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch clustering predictions");
  return res.json();
}

export async function fetchLogisticRegressionPredictions() {
  const res = await fetchWithAuth(`${API_BASE_URL}/predictions/logistic-regression`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch logistic regression predictions");
  return res.json();
}

export async function fetchModelComparison() {
  const res = await fetchWithAuth(`${API_BASE_URL}/predictions/compare`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch model comparison");
  return res.json();
}

export async function fetchModelMetrics() {
  const res = await fetchWithAuth(`${API_BASE_URL}/models/metrics`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch model metrics");
  return res.json();
}

export async function fetchMDXRevenueBySegment() {
  const res = await fetchWithAuth(`${API_BASE_URL}/analytics/mdx/revenue-by-segment`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch MDX revenue");
  return res.json();
}

export async function fetchMDXChurnByDemographics() {
  const res = await fetchWithAuth(`${API_BASE_URL}/analytics/mdx/churn-by-demographics`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch MDX churn demographics");
  return res.json();
}

export async function fetchMDXSpendingDistribution() {
  const res = await fetchWithAuth(`${API_BASE_URL}/analytics/mdx/spending-distribution`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch MDX spending distribution");
  return res.json();
}

export async function fetchCLV() {
  const res = await fetchWithAuth(`${API_BASE_URL}/analytics/clv`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch CLV");
  return res.json();
}

export async function fetchRFMScores() {
  const res = await fetchWithAuth(`${API_BASE_URL}/analytics/rfm-scores`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch RFM scores");
  return res.json();
}

export async function fetchEvaluationReport() {
  const res = await fetchWithAuth(`${API_BASE_URL}/models/evaluation-report`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch evaluation report");
  return res.json();
}

// --- FORECAST API ---

export async function fetchForecast() {
  const res = await fetchWithAuth(`${API_BASE_URL}/analytics/forecast`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch forecast");
  return res.json();
}

// --- AI INSIGHTS API ---

export async function fetchAIInsights() {
  const res = await fetchWithAuth(`${API_BASE_URL}/analytics/ai-insights`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch AI insights");
  return res.json();
}

// --- NOTIFICATIONS API ---

export async function fetchNotifications() {
  const res = await fetchWithAuth(`${API_BASE_URL}/notifications`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function markNotificationRead(id: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
  if (!res.ok) throw new Error("Failed to mark notification");
  return res.json();
}

export async function fetchUnreadCount() {
  const res = await fetchWithAuth(`${API_BASE_URL}/notifications/unread-count`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch unread count");
  return res.json();
}

// --- CAMPAIGNS API ---

export async function fetchCampaigns() {
  const res = await fetchWithAuth(`${API_BASE_URL}/campaigns`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
}

export async function createCampaign(data: {
  name: string;
  segment: string;
  discount_percent: number;
}) {
  const res = await fetchWithAuth(`${API_BASE_URL}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create campaign");
  return res.json();
}

export async function approveCampaign(id: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/campaigns/${id}/approve`, { method: 'PUT' });
  if (!res.ok) throw new Error("Failed to approve campaign");
  return res.json();
}

export async function executeCampaign(id: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/campaigns/${id}/execute`, { method: 'PUT' });
  if (!res.ok) throw new Error("Failed to execute campaign");
  return res.json();
}

