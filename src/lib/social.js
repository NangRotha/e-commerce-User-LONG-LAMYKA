/**
 * Social Links normalization & utilities
 * Supports Telegram, Facebook, Instagram links or handles
 */

export function normalizeTelegram(val) {
  if (!val) return "https://t.me/khmerudomet";
  const trimmed = val.trim();
  if (!trimmed) return "https://t.me/khmerudomet";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const clean = trimmed.replace(/^@/, "");
  return `https://t.me/${clean}`;
}

export function normalizeFacebook(val) {
  if (!val) return "https://facebook.com";
  const trimmed = val.trim();
  if (!trimmed) return "https://facebook.com";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://facebook.com/${trimmed.replace(/^\/+/, "")}`;
}

export function normalizeInstagram(val) {
  if (!val) return "https://instagram.com";
  const trimmed = val.trim();
  if (!trimmed) return "https://instagram.com";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const clean = trimmed.replace(/^@/, "");
  return `https://instagram.com/${clean}`;
}

export function getTelegramOrderUrl(telegramVal, product, price, variant = "") {
  const base = normalizeTelegram(telegramVal);
  // Extract username if it's a t.me link
  const match = base.match(/t\.me\/([^/?#]+)/i);
  const user = match ? match[1] : "khmerudomet";
  let text = `សួស្តី! ខ្ញុំចាប់អារម្មណ៍ចង់ទិញ / សាកសួរផលិតផល៖\n📦 ${product.name}`;
  if (variant) {
    text += `\n🎨 ប្រភេទ/ជម្រើស៖ ${variant}`;
  }
  text += `\n💰 តម្លៃ៖ $${price}\n🔗 ${window.location.href}`;
  return `https://t.me/${user}?text=${encodeURIComponent(text)}`;
}
