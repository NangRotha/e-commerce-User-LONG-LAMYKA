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
