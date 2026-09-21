/**
 * API Client — Storefront (frontend-user)
 *
 * ⚠️ Storefront នេះលែងមាន Login / Sign Up -> អតិថិជនបញ្ជាទិញជា Guest
 * (គ្មាន Token, គ្មានគណនី) ដូច្នេះមិនមាន Authorization Header ទេ។
 *
 * Backend (FastAPI) ពិតប្រាកដនៅលើ Render — ប្រើជា Default ដើម្បីឱ្យ App ដំណើរការ
 * បានទាំង Dev និង Production ដោយមិនចាំបាច់កំណត់ .env។
 * អាចប្តូរបានតាម `VITE_API_URL` ក្នុង `.env` / `.env.development` / `.env.production`
 */
export const DEFAULT_API_BASE = "https://e-commerce-backend-long-lamyka.onrender.com";

export const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE).replace(
  /\/$/,
  ""
);

// URL សម្រាប់ WebSocket (real-time updates: products / orders / settings / alerts)
export function getWsUrl(path = "/ws/products") {
  const wsBase = (import.meta.env.VITE_WS_URL || "").replace(/\/$/, "");
  if (wsBase) return `${wsBase}${path}`;
  // បើគ្មាន VITE_WS_URL -> គណនាពី API_BASE (https:// -> wss://, http:// -> ws://)
  if (API_BASE) return `${API_BASE.replace(/^http/i, "ws")}${path}`;
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}${path}`;
}

// Backwards-compatible alias (still used by the shared RealtimeContext)
export function getProductsWsUrl() {
  return getWsUrl("/ws/products");
}

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof data.detail === "string"
        ? data.detail
        : `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return absolutizeMedia(data);
}

/**
 * ប្រែក្លាយ URL រូបភាពដែលមានផ្លូវខ្លី (/uploads/...) ឲ្យទៅជា URL ពេញ
 * សំខាន់នៅពេល Deploy Frontend លើ Vercel ប៉ុន្តែ API/រូបភាពនៅលើ Render
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
  // ===== Catalog =====
  getProducts: () => request("/api/products"),
  getProduct: (id) => request(`/api/products/${id}`),
  getCategories: () => request("/api/categories"),
  getSlides: () => request("/api/slides"),
  getAlerts: () => request("/api/alerts"),

  // ===== Orders — Guest Checkout (គ្មាន Token) =====
  checkout: (payload) =>
    request("/api/orders/checkout", { method: "POST", body: payload }),
  getOrderStatus: (orderId) => request(`/api/orders/${orderId}/status`),

  // ===== Payments — ABA Pay / Bakong Wallet (KHQR) + auto-detect =====
  getPaymentConfig: () => request("/api/payments/config"),
  checkPaymentStatus: (transaction_id) =>
    request("/api/payments/status", {
      method: "POST",
      body: { transaction_id },
    }),
  confirmPayment: (transaction_id) =>
    request("/api/payments/confirm", {
      method: "POST",
      body: { transaction_id },
    }),

  // ===== Discounts =====
  validatePromo: (code) =>
    request(`/api/discounts/validate/${encodeURIComponent(code)}`),

  // ===== Settings (site name / logo / payment branding) =====
  getSettings: () => request("/api/settings/all"),

  // ===== AI Chat (DeepSeek) =====
  getChatConfig: () => request("/api/chat/config"),
  sendChatMessage: (message, history = []) =>
    request("/api/chat/message", {
      method: "POST",
      body: { message, history },
    }),
};
