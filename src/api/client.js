const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "shop_token";

// URL សម្រាប់ WebSocket (real-time updates from admin)
export function getWsUrl(path = "/ws/products") {
  const wsBase = (import.meta.env.VITE_WS_URL || "").replace(/\/$/, "");
  if (wsBase) return `${wsBase}${path}`;
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}${path}`;
}

// Backwards-compatible alias (still used by the shared RealtimeContext)
export function getProductsWsUrl() {
  return getWsUrl("/ws/products");
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof data.detail === "string"
        ? data.detail
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return absolutizeMedia(data);
}

/**
 * ប្រែក្លាយ URL រូបភាពដែលមានផ្លូវខ្លី (/uploads/...) ឲ្យទៅជា URL ពេញ
 * សំខាន់នៅពេល Deploy Frontend លើ Vercel ប៉ុន្តែ API/រូបភាពនៅលើ Render
 * (ដោយគ្មានការប្រែក្លាយនេះ រូបភាពនឹងខូច ព្រោះវាមានផ្លូវទាក់ទងខ្លី)
 */
function absolutizeMedia(data) {
  if (Array.isArray(data)) {
    data.forEach(absolutizeMedia);
  } else if (data && typeof data === "object") {
    Object.keys(data).forEach((k) => {
      const v = data[k];
      if (typeof v === "string" && v.startsWith("/uploads/")) {
        data[k] = API_BASE ? `${API_BASE}${v}` : v;
      } else if (v && typeof v === "object") {
        absolutizeMedia(v);
      }
    });
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) =>
    request("/api/auth/register", { method: "POST", body: payload }),
  verifyOtp: (payload) =>
    request("/api/auth/verify-otp", { method: "POST", body: payload }),
  resendOtp: (payload) =>
    request("/api/auth/resend-otp", { method: "POST", body: payload }),
  login: (payload) =>
    request("/api/auth/login", { method: "POST", body: payload }),
  telegramLogin: (payload) =>
    request("/api/auth/telegram", { method: "POST", body: payload }),
  // Telegram config
  getTelegramConfig: () => request("/api/auth/telegram/config"),

  // Profile
  getMe: () => request("/api/users/me", { auth: true }),
  updateProfile: (payload) =>
    request("/api/users/me", { method: "PUT", body: payload, auth: true }),
  changePassword: (payload) =>
    request("/api/users/me/password", { method: "PUT", body: payload, auth: true }),
  uploadProfileImage: async (file) => {
    const token = getToken();
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/api/users/me/upload-image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        typeof data.detail === "string"
          ? data.detail
          : `Upload failed (${res.status})`;
      throw new Error(msg);
    }
    return absolutizeMedia(data);
  },

  // Categories
  getCategories: () => request("/api/categories"),

  // Slides (homepage banners)
  getSlides: () => request("/api/slides"),

  // Alerts (banners / popups from admin)
  getAlerts: () => request("/api/alerts"),

  // Products
  getProducts: () => request("/api/products"),
  getProduct: (id) => request(`/api/products/${id}`),
  createProduct: (payload) =>
    request("/api/admin/products", { method: "POST", body: payload }),

  // Orders
  checkout: (payload) =>
    request("/api/orders/checkout", { method: "POST", body: payload, auth: true }),

  // Discounts
  validatePromo: (code) =>
    request(`/api/discounts/validate/${encodeURIComponent(code)}`),

  // Settings
  getSettings: () => request("/api/settings/all"),

  // AI Chat (DeepSeek)
  getChatConfig: () => request("/api/chat/config"),
  sendChatMessage: (message, history = []) =>
    request("/api/chat/message", {
      method: "POST",
      body: { message, history },
    }),
};
