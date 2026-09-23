// ជំនួយសម្រាប់គណនាតម្លៃ

/** តម្លៃពិតប្រាកដបន្ទាប់ពីដក Sale Discount */
export function effectivePrice(p) {
  if (p && p.is_on_sale && Number(p.sale_percent) > 0) {
    return p.price * (1 - Number(p.sale_percent) / 100);
  }
  return p ? Number(p.price) || 0 : 0;
}

export function formatPrice(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

/** ពិនិត្យថា URL ជាវីដេអូ ឬរូបភាព (ប្រើក្នុង Gallery ផលិតផល) */
export function isVideoUrl(url) {
  if (!url) return false;
  const s = String(url);
  if (/(youtu\.be|youtube\.com)/i.test(s)) return true;
  if (/\/video\/upload\//i.test(s)) return true;
  return /\.(mp4|webm|mov|ogg|m4v|mkv|quicktime)(\?|#|$)/i.test(s);
}

/* ============================================================
 * ជំនួយពហុភាសា (Khmer 🇰🇭 / English 🇬🇧)
 * ទិន្នន័យមាន 2 ភាសា៖ name / description (EN) និង name_km / description_km (KM)
 * បើភាសាដែលកំពុងប្រើមិនទាន់បំពេញ -> Fallback ទៅភាសាមួយទៀត
 * ============================================================ */

/** ឈ្មោះផលិតផល/ប្រភេទ តាមភាសាដែលកំពុងប្រើ */
export function localizedName(item, lang) {
  if (!item) return "";
  const en = String(item.name || "").trim();
  const km = String(item.name_km || "").trim();
  return (lang === "km" ? km || en : en || km) || "";
}

/** ការពិពណ៌នា តាមភាសាដែលកំពុងប្រើ */
export function localizedDescription(item, lang) {
  if (!item) return "";
  const en = String(item.description || "").trim();
  const km = String(item.description_km || "").trim();
  return (lang === "km" ? km || en : en || km) || "";
}

/** ឈ្មោះប្រភេទ តាមភាសា — value នៅតែជា name (EN) សម្រាប់ Filter/API */
export function localizedCategoryName(name, catMap, lang) {
  const en = String(name || "").trim();
  if (!en) return "";
  const km = String((catMap && catMap[en]) || "").trim();
  return (lang === "km" ? km || en : en || km) || "";
}

