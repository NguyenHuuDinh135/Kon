const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeader() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("kon_token");
    if (token) return { "Authorization": `Bearer ${token}` };
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
  const headers = {
    ...options.headers,
    ...getAuthHeader(),
  };
  
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
  return res;
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

export async function updateProduct(productId: number, productData: any) {
  const res = await fetchWithAuth(`${API_BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteProduct(productId: number) {
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
