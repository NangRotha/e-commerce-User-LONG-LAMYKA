import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X, SlidersHorizontal, Sparkles, ShoppingBag, ArrowUpDown, Filter } from "lucide-react";
import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";
import TrustBar from "../components/TrustBar";
import Reveal from "../components/Reveal";
import StoreLocationSection from "../components/StoreLocationSection";
import { api } from "../api/client";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";
import { localizedCategoryName } from "../lib/helpers";
import useSiteSettings from "../hooks/useSiteSettings";

// ផលិតផលសាកល្បងសម្រាប់បញ្ចូលទិន្នន័យពេល Database ទទេ
const DEMO_PRODUCTS = [
  { name: "Wireless Earbuds Pro", description: "High-quality wireless earbuds with noise cancellation and 30h battery life.", price: 89.99, stock: 25, category: "Electronics", is_on_sale: true, sale_percent: 15 },
  { name: "Smart Watch S9", description: "Track your fitness, heart rate and notifications with a stunning AMOLED display.", price: 199.0, stock: 12, category: "Electronics", is_on_sale: false, sale_percent: 0 },
  { name: "Classic Denim Jacket", description: "Timeless denim jacket, perfect for every season. Machine washable.", price: 59.99, stock: 30, category: "Fashion", is_on_sale: true, sale_percent: 10 },
  { name: "Cotton T-Shirt", description: "Soft 100% cotton tee in a relaxed fit. Available in multiple colors.", price: 19.99, stock: 80, category: "Fashion", is_on_sale: false, sale_percent: 0 },
  { name: "Ceramic Coffee Mug", description: "Handcrafted 350ml ceramic mug, dishwasher and microwave safe.", price: 14.5, stock: 50, category: "Home", is_on_sale: false, sale_percent: 0 },
  { name: "Scented Candle Set", description: "Set of 3 soy wax candles: lavender, vanilla and sandalwood.", price: 24.99, stock: 40, category: "Home", is_on_sale: true, sale_percent: 20 },
  { name: "Leather Wallet", description: "Genuine leather wallet with 6 card slots and RFID protection.", price: 34.99, stock: 35, category: "Accessories", is_on_sale: false, sale_percent: 0 },
  { name: "Sunglasses Aviator", description: "Polarized aviator sunglasses with UV400 protection.", price: 45.0, stock: 28, category: "Accessories", is_on_sale: true, sale_percent: 25 },
  { name: "Vitamin C Serum", description: "Brightening serum with 20% vitamin C for glowing skin.", price: 27.99, stock: 45, category: "Beauty", is_on_sale: false, sale_percent: 0 },
  { name: "Lipstick Matte", description: "Long-lasting matte lipstick in a range of bold shades.", price: 12.99, stock: 60, category: "Beauty", is_on_sale: false, sale_percent: 0 },
];

/** Home — Storefront (i18n km/en + trust bar + sorting + real-time auto-refresh) */
export default function Home() {
  const { t, lang } = useI18n();
  const [products, setProducts] = useState(null);
  const settings = useSiteSettings();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState("");

  const loadProducts = () => {
    api
      .getProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  };

  const loadCategories = () => {
    api
      .getCategories()
      .then((cats) => setCategories(cats || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Real-time: ពេល Admin កែផលិតផល / Category -> ទាញទិន្នន័យថ្មីភ្លាមៗ
  useRealtime(["products_changed", "categories_changed"], () => {
    loadProducts();
    loadCategories();
  });

  const seedDemo = async () => {
    setSeeding(true);
    setSeedError("");
    try {
      for (const d of DEMO_PRODUCTS) {
        await api.createProduct({
          ...d,
          image_url: `https://picsum.photos/seed/${d.name.replace(/\s+/g, "").toLowerCase()}/600/600`,
        });
      }
      loadProducts();
    } catch (e) {
      setSeedError(
        /authent|forbidden|401|403|admin/i.test(e.message || "")
          ? t("home.adminOnlyDemo")
          : e.message
      );
    } finally {
      setSeeding(false);
    }
  };

  // name (EN) -> name_km  សម្រាប់បង្ហាញឈ្មោះ Category តាមភាសាដែលកំពុងប្រើ
  const catMap = useMemo(
    () => Object.fromEntries((categories || []).map((c) => [c.name, c.name_km || ""])),
    [categories]
  );
  const catLabel = useCallback(
    (name) =>
      name === "All" ? t("home.all") : localizedCategoryName(name, catMap, lang),
    [catMap, lang, t]
  );

  // Filter and sort products
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = (products || []).filter((p) => {
      const catOk = category === "All" || p.category === category;
      const searchOk =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.name_km || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.description_km || "").toLowerCase().includes(q) ||
        catLabel(p.category || "").toLowerCase().includes(q);
      const stockOk = !inStockOnly || p.stock > 0;
      return catOk && searchOk && stockOk;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      const priceA = a.is_on_sale && a.sale_percent > 0 ? a.price * (1 - a.sale_percent / 100) : a.price;
      const priceB = b.is_on_sale && b.sale_percent > 0 ? b.price * (1 - b.sale_percent / 100) : b.price;

      if (sortBy === "price_asc") return priceA - priceB;
      if (sortBy === "price_desc") return priceB - priceA;
      if (sortBy === "discount") return (b.sale_percent || 0) - (a.sale_percent || 0);
      return (b.id || 0) - (a.id || 0); // newest first
    });

    return list;
  }, [products, category, search, sortBy, inStockOnly, catLabel]);

  // Categories list — value នៅតែជា name អង់គ្លេស (Key សម្រាប់ Filter និង API)
  const categoryOptions = useMemo(() => {
    if (categories.length) return ["All", ...categories.map((c) => c.name)];
    const uniq = [...new Set((products || []).map((p) => p.category).filter(Boolean))];
    return ["All", ...uniq.sort()];
  }, [categories, products]);


  // Category items count helper
  const getCategoryCount = (cat) => {
    if (!products) return 0;
    if (cat === "All") return products.length;
    return products.filter((p) => p.category === cat).length;
  };

  const countLabel =
    filtered.length === 1
      ? t("home.availableCountOne")
      : t("home.availableCount", { count: filtered.length });

  const hasActiveFilters = category !== "All" || search.trim() !== "" || inStockOnly || sortBy !== "newest";

  const resetAllFilters = () => {
    setCategory("All");
    setSearch("");
    setSortBy("newest");
    setInStockOnly(false);
  };

  // Helper for category cute icons
  const getCategoryEmoji = (c) => {
    const lower = (c || "").toLowerCase();
    if (lower === "all") return "🌸";
    if (lower.includes("fashion") || lower.includes("cloth") || lower.includes("top") || lower.includes("dress")) return "👗";
    if (lower.includes("beauty") || lower.includes("cosmetic") || lower.includes("skin")) return "💄";
    if (lower.includes("access") || lower.includes("jewelry") || lower.includes("bag")) return "🎀";
    if (lower.includes("electronic") || lower.includes("phone") || lower.includes("gadget")) return "🎧";
    if (lower.includes("home") || lower.includes("living") || lower.includes("decor")) return "🕯️";
    return "✨";
  };

  return (
    <div className="space-y-6">
      {/* Hero Slider */}
      <HeroSlider
        fallback={
          <section className="relative overflow-hidden luxury-card clay-card py-10 sm:py-14 px-6 sm:px-12 mx-3 sm:mx-6 rounded-3xl sm:rounded-[32px] shadow-soft">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="max-w-xl text-left">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full clay-nav-active text-white font-black text-xs uppercase tracking-widest shadow-2xs mb-3 animate-pop-in">
                  <span>✨</span> {t("home.collectionTagline")}
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {settings.site_name || t("home.heroTitle")}
                </h1>
                <p className="mt-3 text-slate-600 dark:text-purple-200 text-base sm:text-lg font-semibold max-w-lg">
                  {t("home.heroSubtitle")}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <a
                    href="#products-section"
                    className="clay-nav-active px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-soft inline-flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>🛍️</span>
                    <span>{t("product.shopNow") || "Shop Now"}</span>
                  </a>
                </div>
              </div>
              <div className="shrink-0 relative">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-white dark:border-purple-900/60 shadow-soft bg-gradient-to-tr from-purple-100 to-pink-100 dark:from-purple-950 dark:to-indigo-950 flex items-center justify-center animate-float">
                  <img src="/avatar_clay.jpg" alt="LONG LAMYKA" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </section>
        }
      />

      {/* Trust & Benefits Bar — 4 Clay Stat Cards Matched with Frontend-Admin */}
      <TrustBar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 pb-16">
        {/* Search, Filter & Sort Controls — 3D Clay Card */}
        <div className="clay-card p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-purple-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("home.searchPlaceholder") || "Search products... 🌸"}
                className="w-full pl-11 pr-10 py-3 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-purple-50/30 dark:bg-[#120e1a] text-slate-800 dark:text-purple-100 placeholder:text-purple-300 dark:placeholder:text-purple-400/50 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-[#1c1626] transition shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & In-stock toggle */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap xs:flex-nowrap">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-purple-50/40 dark:bg-[#120e1a] text-xs font-bold text-slate-700 dark:text-purple-200 shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-purple-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none focus:outline-none cursor-pointer text-xs font-bold text-slate-700 dark:text-purple-200"
                >
                  <option value="newest">✨ {t("home.sortNewest") || "Newest"}</option>
                  <option value="price_asc">🎀 {t("home.sortPriceAsc") || "Price: Low to High"}</option>
                  <option value="price_desc">💖 {t("home.sortPriceDesc") || "Price: High to Low"}</option>
                  <option value="discount">🔥 {t("home.sortDiscount") || "Biggest Discount"}</option>
                </select>
              </div>

              {/* In-stock toggle */}
              <button
                type="button"
                onClick={() => setInStockOnly((v) => !v)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all duration-200 flex items-center gap-1.5 shadow-2xs ${
                  inStockOnly
                    ? "clay-nav-active shadow-soft"
                    : "border-purple-200/80 dark:border-purple-900/50 bg-purple-50/40 dark:bg-[#120e1a] text-slate-600 dark:text-purple-200 hover:border-purple-400"
                }`}
              >
                <span>{inStockOnly ? "💖" : "🤍"}</span>
                <span>{t("home.inStockOnly") || "In Stock Only"}</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 w-full max-w-full touch-pan-x">
            {categoryOptions.map((c) => {
              const count = getCategoryCount(c);
              const isActive = category === c;
              const emoji = getCategoryEmoji(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "clay-nav-active shadow-soft scale-102"
                      : "clay-circle-btn text-slate-700 dark:text-purple-200"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{catLabel(c)}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive
                          ? "bg-white/30 text-white"
                          : "bg-purple-200/70 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="shrink-0 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 px-3.5 py-1.5 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t("home.resetFilter") || "Reset"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Title Header */}
        <Reveal className="mt-8 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-soft">
              <span className="text-base">✨</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <span>{category === "All" ? (t("home.featured") || "Featured Lovely Picks") : catLabel(category)}</span>
                <span className="text-base">💖</span>
              </h2>
              <p className="text-xs sm:text-sm text-purple-600/80 dark:text-purple-300/80 font-bold mt-0.5">
                {countLabel}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Products Grid */}
        {products === null ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="clay-card overflow-hidden"
              >
                <div className="aspect-square shimmer" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 bg-purple-100 dark:bg-purple-950/60 rounded-full w-1/3" />
                  <div className="h-4 bg-purple-100 dark:bg-purple-950/60 rounded-full w-3/4" />
                  <div className="h-5 bg-purple-100 dark:bg-purple-950/60 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filtered.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i, 11) * 45}ms` }}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </Reveal>
        ) : (
          <div className="text-center py-16 sm:py-20 clay-card border border-purple-200/60 dark:border-purple-900/30 animate-fade-in-up px-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-3xl mx-auto mb-4 shadow-soft">
              🛍️
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
              {search || category !== "All" || inStockOnly ? t("home.noMatch") : t("home.noProducts")}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-purple-300/70 max-w-sm mx-auto font-medium">
              {search || category !== "All" || inStockOnly
                ? t("home.noMatchHint")
                : t("home.noProductsHint")}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-5 px-5 py-2.5 rounded-2xl clay-nav-active font-bold text-sm hover:opacity-95 transition active:scale-95 shadow-soft"
              >
                {t("home.resetFilter") || "Clear all filters"}
              </button>
            )}

            {!(search || category !== "All" || inStockOnly) && (
              <>
                <button
                  type="button"
                  onClick={seedDemo}
                  disabled={seeding}
                  className="mt-6 px-6 py-3 rounded-2xl clay-nav-active font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 text-sm shadow-soft"
                >
                  {seeding ? t("common.loading") : t("home.loadDemo")}
                </button>
                {seedError && (
                  <p className="mt-3 text-xs sm:text-sm text-rose-600 animate-fade-in">
                    {seedError}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Physical Store Location & Google Maps */}
        <Reveal>
          <StoreLocationSection />
        </Reveal>
      </div>
    </div>
  );
}
