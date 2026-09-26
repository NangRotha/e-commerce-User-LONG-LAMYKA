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

/**
 * វចនានុក្រមប្រភេទផលិតផល Khmer (EN -> KM)
 * រួមបញ្ចូល Category ពី Database និង Category ទូទៅ
 */
export const CATEGORY_KM_DICT = {
  // Database categories (ពី Database / API)
  "Cosmetics": "គ្រឿងសម្អាង",
  "Cosmetic": "គ្រឿងសម្អាង",
  "Face Mask": "ម៉ាស់បិទមុខ",
  "Facemask": "ម៉ាស់បិទមុខ",
  "Face Masks": "ម៉ាស់បិទមុខ",
  "Toothpaste": "ថ្នាំដុសធ្មេញ",
  "Toothpastes": "ថ្នាំដុសធ្មេញ",
  "Shoulder Bags": "កាបូបស្ពាយ",
  "Shoulder Bag": "កាបូបស្ពាយ",
  "Backpack": "កាបូប",
  "Backpacks": "កាបូប",

  // Common E-Commerce categories
  "Beauty": "សម្រស់ និងការថែទាំ",
  "Skincare": "ថែរក្សាស្បែក",
  "Skin Care": "ថែរក្សាស្បែក",
  "Makeup": "គ្រឿងផាត់មុខ",
  "Clothing": "សម្លៀកបំពាក់",
  "Clothes": "សម្លៀកបំពាក់",
  "Fashion": "ម៉ូដ និងសម្លៀកបំពាក់",
  "Accessories": "គ្រឿងតុបតែង",
  "Accessory": "គ្រឿងតុបតែង",
  "Bags": "កាបូប",
  "Bag": "កាបូប",
  "Shoes": "ស្បែកជើង",
  "Jewelry": "គ្រឿងអលង្ការ",
  "Perfume": "ទឹកអប់",
  "Fragrance": "ទឹកអប់",
  "Lipstick": "ក្រែមលាបមាត់",
  "Body Care": "ថែរក្សាដងខ្លួន",
  "Hair Care": "ថែរក្សាសក់",
  "Electronics": "ឧបករណ៍អេឡិចត្រូនិច",
  "Electronic": "ឧបករណ៍អេឡិចត្រូនិច",
  "Health": "សុខភាព",
  "Home & Living": "របស់ប្រើប្រាស់ក្នុងផ្ទះ",
  "Home": "គេហដ្ឋាន",
  "Decor": "តុបតែង",
  "Gifts": "កាដូ",
  "Food": "ម្ហូបអាហារ",
  "Snacks": "នំចំណី",
  "Drinks": "ភេសជ្ជៈ",
  "Other": "ផ្សេងៗ",
};

/**
 * វចនានុក្រមបកប្រែត្រឡប់មក English (KM -> EN)
 */
export const CATEGORY_EN_DICT = {
  "គ្រឿងសម្អាង": "Cosmetics",
  "ម៉ាស់បិទមុខ": "Face Mask",
  "ថ្នាំដុសធ្មេញ": "Toothpaste",
  "កាបូបស្ពាយ": "Shoulder Bags",
  "កាបូប": "Backpack",
  "សម្រស់ និងការថែទាំ": "Beauty",
  "ថែរក្សាស្បែក": "Skincare",
  "គ្រឿងផាត់មុខ": "Makeup",
  "សម្លៀកបំពាក់": "Clothing",
  "ម៉ូដ និងសម្លៀកបំពាក់": "Fashion",
  "គ្រឿងតុបតែង": "Accessories",
  "ស្បែកជើង": "Shoes",
  "គ្រឿងអលង្ការ": "Jewelry",
  "ទឹកអប់": "Perfume",
  "ក្រែមលាបមាត់": "Lipstick",
  "ថែរក្សាដងខ្លួន": "Body Care",
  "ថែរក្សាសក់": "Hair Care",
  "ឧបករណ៍អេឡិចត្រូនិច": "Electronics",
  "សុខភាព": "Health",
  "របស់ប្រើប្រាស់ក្នុងផ្ទះ": "Home & Living",
  "គេហដ្ឋាន": "Home",
  "តុបតែង": "Decor",
  "កាដូ": "Gifts",
  "ម្ហូបអាហារ": "Food",
  "នំចំណី": "Snacks",
  "ភេសជ្ជៈ": "Drinks",
  "ផ្សេងៗ": "Other",
};

// Dynamic runtime category map fetched from API
let runtimeCategoryMap = {};

export function registerCategoryTranslations(categories) {
  if (Array.isArray(categories)) {
    for (const c of categories) {
      if (c && c.name && c.name_km) {
        const en = String(c.name).trim();
        const km = String(c.name_km).trim();
        runtimeCategoryMap[en] = km;
        runtimeCategoryMap[en.toLowerCase()] = km;
      }
    }
  }
}

/** ឈ្មោះប្រភេទ តាមភាសា — value នៅតែជា name (EN) សម្រាប់ Filter/API */
export function localizedCategoryName(name, catMap = {}, lang = "en") {
  const raw = String(name || "").trim();
  if (!raw) return "";

  if (lang === "km") {
    // 1. Direct catMap lookup
    if (catMap && catMap[raw]) return String(catMap[raw]).trim();
    if (catMap && catMap[raw.toLowerCase()]) return String(catMap[raw.toLowerCase()]).trim();

    // 2. Runtime category map from API
    if (runtimeCategoryMap[raw]) return runtimeCategoryMap[raw];
    if (runtimeCategoryMap[raw.toLowerCase()]) return runtimeCategoryMap[raw.toLowerCase()];

    // 3. Built-in CATEGORY_KM_DICT
    if (CATEGORY_KM_DICT[raw]) return CATEGORY_KM_DICT[raw];
    const matchKey = Object.keys(CATEGORY_KM_DICT).find(
      (k) => k.toLowerCase() === raw.toLowerCase()
    );
    if (matchKey) return CATEGORY_KM_DICT[matchKey];

    return raw;
  }

  // English mode
  if (CATEGORY_EN_DICT[raw]) return CATEGORY_EN_DICT[raw];
  const kmKey = Object.keys(runtimeCategoryMap).find(
    (k) => runtimeCategoryMap[k] === raw
  );
  if (kmKey) return kmKey;

  return raw;
}

/** ឈ្មោះប្រភេទផលិតផល តាមភាសាដែលកំពុងប្រើ */
export function localizedProductCategory(product, lang = "en", catMap = {}) {
  if (!product) return "";
  const directKm = String(product.category_km || "").trim();
  const directEn = String(product.category || "").trim();

  if (lang === "km") {
    if (directKm) return directKm;
    if (directEn) return localizedCategoryName(directEn, catMap, "km");
    return "";
  }

  // English mode
  if (directEn) {
    return localizedCategoryName(directEn, catMap, "en");
  }
  if (directKm) {
    return localizedCategoryName(directKm, catMap, "en");
  }
  return "";
}

