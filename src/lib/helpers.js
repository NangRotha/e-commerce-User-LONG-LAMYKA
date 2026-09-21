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
