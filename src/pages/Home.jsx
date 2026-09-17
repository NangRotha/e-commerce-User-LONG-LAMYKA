import { useEffect, useMemo, useState } from "react";
import { Search, X, SlidersHorizontal, Sparkles, ShoppingBag, ArrowUpDown, Filter } from "lucide-react";
import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";
import TrustBar from "../components/TrustBar";
import Reveal from "../components/Reveal";
import StoreLocationSection from "../components/StoreLocationSection";
import { api } from "../api/client";
import useProductsRealtime from "../hooks/useProductsRealtime";
import { useI18n } from "../i18n/I18nContext";

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
  const { t } = useI18n();
  const [products, setProducts] = useState(null);
  const [settings, setSettings] = useState({});
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
      .then((cats) => setCategories(cats.map((c) => c.name)))
      .catch(() => {});
  };

  const loadSettings = () => {
    api.getSettings().then(setSettings).catch(() => {});
  };

  useEffect(() => {
    loadProducts();
    loadSettings();
    loadCategories();
  }, []);

  // Real-time: ពេល Admin កែផលិតផល / Category / Settings -> ទាញទិន្នន័យថ្មីភ្លាមៗ
  const live = useProductsRealtime(() => {
    loadProducts();
    loadCategories();
    loadSettings();
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

  // Filter and sort products
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = (products || []).filter((p) => {
      const catOk = category === "All" || p.category === category;
      const searchOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q);
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
  }, [products, category, search, sortBy, inStockOnly]);

  // Categories list
  const categoryOptions = useMemo(() => {
    if (categories.length) return ["All", ...categories];
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

  return (
    <div className="space-y-6">
      {/* Hero Slider */}
      <HeroSlider
        fallback={
          <section className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white animate-gradient">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl animate-fade-in-up">
                {settings.site_name || t("home.heroTitle")}
              </h1>
              <p className="mt-4 text-emerald-100 text-lg max-w-xl animate-fade-in-up" style={{ animationDelay: "120ms" }}>
                {t("home.heroSubtitle")}
              </p>
            </div>
          </section>
        }
      />

      {/* Trust & Benefits Bar */}
      <TrustBar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 pb-16">
        {/* Search, Filter & Sort Controls */}
        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("home.searchPlaceholder")}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & In-stock toggle */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap xs:flex-nowrap">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none focus:outline-none cursor-pointer text-xs"
                >
                  <option value="newest">{t("home.sortNewest") || "Newest"}</option>
                  <option value="price_asc">{t("home.sortPriceAsc") || "Price: Low to High"}</option>
                  <option value="price_desc">{t("home.sortPriceDesc") || "Price: High to Low"}</option>
                  <option value="discount">{t("home.sortDiscount") || "Biggest Discount"}</option>
                </select>
              </div>

              {/* In-stock toggle */}
              <button
                type="button"
                onClick={() => setInStockOnly((v) => !v)}
                className={`px-3 py-2 rounded-2xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 ${
                  inStockOnly
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-emerald-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${inStockOnly ? "bg-white" : "bg-emerald-500"}`} />
                {t("home.inStockOnly") || "In stock"}
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 w-full max-w-full touch-pan-x">
            {categoryOptions.map((c) => {
              const count = getCategoryCount(c);
              const isActive = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 scale-102"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{c === "All" ? t("home.all") : c}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
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
                className="shrink-0 text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                {t("home.resetFilter") || "Reset"}
              </button>
            )}
          </div>
        </div>

        {/* Section Title Header */}
        <Reveal className="mt-8 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {category === "All" ? t("home.featured") : category}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
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
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-soft overflow-hidden"
              >
                <div className="aspect-square shimmer" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-1/3" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4" />
                  <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2" />
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
          <div className="text-center py-16 sm:py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 animate-fade-in-up px-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mx-auto mb-4">
              🛍️
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
              {search || category !== "All" || inStockOnly ? t("home.noMatch") : t("home.noProducts")}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {search || category !== "All" || inStockOnly
                ? t("home.noMatchHint")
                : t("home.noProductsHint")}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition active:scale-95 shadow-md"
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
                  className="mt-6 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-semibold transition-all duration-200 hover:bg-emerald-700 hover:shadow-lift active:scale-95 disabled:opacity-50 text-sm"
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
