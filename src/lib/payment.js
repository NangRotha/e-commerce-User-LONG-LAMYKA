/**
 * ជំនួយសម្រាប់ការបង់ប្រាក់ (Bakong Wallet / KHQR) និងការបង្ហាញតម្លៃតាមរូបិយប័ណ្ណ
 *
 * - តម្លៃក្នុង Database ត្រូវបានរក្សាជា USD ជានិច្ច
 * - បើ Admin កំណត់រូបិយប័ណ្ណជា KHR -> បំលែងតាមអត្រា (khr_rate) សម្រាប់ការបង្ហាញ
 */

export const CURRENCIES = [
  { code: "USD", label: "USD ($)", symbol: "$" },
  { code: "KHR", label: "KHR (៛)", symbol: "៛" },
];

export const DEFAULT_KHR_RATE = 4100;

export function money(n) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

export function toKhr(usd, rate = DEFAULT_KHR_RATE) {
  const r = Number(rate) > 0 ? Number(rate) : DEFAULT_KHR_RATE;
  return Math.round((Number(usd) || 0) * r);
}

/** បង្ហាញតម្លៃតាមរូបិយប័ណ្ណដែល Admin កំណត់ */
export function formatMoney(amount, currency = "USD", rate = DEFAULT_KHR_RATE) {
  if (String(currency).toUpperCase() === "KHR") {
    return `${toKhr(amount, rate).toLocaleString("en-US")} ៛`;
  }
  return money(amount);
}

/** បង្ហាញតម្លៃទាំងពីរប្រភេទ (ឧ. KHR ជា main + USD ជា secondary) */
export function formatMoneyPair(amount, currency = "USD", rate = DEFAULT_KHR_RATE) {
  if (String(currency).toUpperCase() === "KHR") {
    return { main: formatMoney(amount, "KHR", rate), alt: money(amount) };
  }
  return { main: money(amount), alt: formatMoney(amount, "KHR", rate) };
}

/** ពិនិត្យលេខទូរសព្ទ (សម្រាប់ Guest Checkout) */
export function isValidPhone(phone) {
  const digits = String(phone || "").replace(/[^0-9]/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}
