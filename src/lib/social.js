/**
 * Social Links normalization & utilities
 * Supports Telegram, Facebook, Instagram, TikTok, WhatsApp links or handles
 */

export function normalizeTikTok(val) {
  if (!val) return "";
  const trimmed = val.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const clean = trimmed.replace(/^@/, "");
  return `https://tiktok.com/@${clean}`;
}

export function normalizeTelegram(val) {
  if (!val) return "https://t.me/Lamykabot";
  const trimmed = val.trim();
  if (!trimmed || trimmed.toLowerCase().includes("khmerudomet")) return "https://t.me/Lamykabot";
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

export function normalizeWhatsApp(val) {
  if (!val) return "";
  const trimmed = val.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  // Clean non-digits (keeping optional leading +)
  let clean = trimmed.replace(/[^\d+]/g, "");
  if (clean.startsWith("+")) {
    clean = clean.slice(1);
  } else if (clean.startsWith("0")) {
    // Cambodian local format 012... -> 85512...
    clean = "855" + clean.slice(1);
  }
  return clean ? `https://wa.me/${clean}` : "";
}

export function getTelegramOrderUrl(telegramVal, product, price, variant = "") {
  const base = normalizeTelegram(telegramVal);
  // Extract username if it's a t.me link
  const match = base.match(/t\.me\/([^/?#]+)/i);
  let user = match ? match[1] : "Lamykabot";
  if (user.toLowerCase() === "khmerudomet") user = "Lamykabot";
  let text = `សួស្តី! ខ្ញុំចាប់អារម្មណ៍ចង់ទិញ / សាកសួរផលិតផល៖\n📦 ${product?.name || ""}`;
  if (variant) {
    text += `\n🎨 ប្រភេទ/ជម្រើស៖ ${variant}`;
  }
  if (price !== undefined && price !== null) {
    text += `\n💰 តម្លៃ៖ $${price}`;
  }
  if (typeof window !== "undefined" && window.location) {
    text += `\n🔗 ${window.location.href}`;
  }
  return `https://t.me/${user}?text=${encodeURIComponent(text)}`;
}

export function getWhatsAppOrderUrl(whatsappVal, product, price, variant = "") {
  const base = normalizeWhatsApp(whatsappVal);
  if (!base) return "";

  // Extract phone number if it's a wa.me URL
  let phone = "";
  const waMeMatch = base.match(/wa\.me\/(\d+)/i);
  const apiMatch = base.match(/[?&]phone=(\d+)/i);
  if (waMeMatch) {
    phone = waMeMatch[1];
  } else if (apiMatch) {
    phone = apiMatch[1];
  } else {
    const digits = base.replace(/[^\d]/g, "");
    if (digits) phone = digits;
  }

  let text = `សួស្តី! ខ្ញុំចាប់អារម្មណ៍ចង់ទិញ / សាកសួរផលិតផល៖\n📦 ${product?.name || ""}`;
  if (variant) {
    text += `\n🎨 ប្រភេទ/ជម្រើស៖ ${variant}`;
  }
  if (price !== undefined && price !== null) {
    text += `\n💰 តម្លៃ៖ $${price}`;
  }
  if (typeof window !== "undefined" && window.location) {
    text += `\n🔗 ${window.location.href}`;
  }

  if (phone) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}text=${encodeURIComponent(text)}`;
}

