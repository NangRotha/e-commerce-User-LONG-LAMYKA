import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";
import Reveal from "../components/Reveal";
import { api } from "../api/client";
import useProductsRealtime from "../hooks/useProductsRealtime";

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

export default function Home() {
  const [products, setProducts] = useState(null);
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState("");

  const loadProducts = () => {
    api
      .getProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  };

  const loadCategories = () => {
    // ទាញ Category ពី API (Admin គ្រប់គ្រងក្នុង Admin Panel)
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

  // បច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ៖ ពេល Admin កែផលិតផល / Category / Settings
  // -> ទាញទិន្នន័យថ្មីទាំងអស់ដោយមិនចាំបាច់ Refresh
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
      setSeedError(e.message);
    } finally {
      setSeeding(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (products || []).filter((p) => {
      const catOk = category === "All" || p.category === category;
      const searchOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [products, category, search]);

  // បញ្ជី Category សម្រាប់ Filter៖ យកពី API ជាមុនសិន។
  // បើ API មិនមាន Category (ទទេ) -> ដកយកពីផលិតផលដែលមានស្រាប់
  const categoryOptions = useMemo(() => {
    if (categories.length) return ["All", ...categories];
    const uniq = [
      ...new Set((products || []).map((p) => p.category).filter(Boolean)),
    ];
    return ["All", ...uniq.sort()];
  }, [categories, products]);

  return (
    <div>
      {/* Hero Slider (រូប / វីដេអូ / YouTube) — បើគ្មាន Slide ទេ -> បង្ហាញ Hero ធម្មតា */}
      <HeroSlider
        fallback={
          <section className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white animate-gradient">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl">
                {settings.site_name || "Welcome to our store"}
              </h1>
              <p className="mt-4 text-emerald-100 text-lg max-w-xl">
                Discover amazing products at unbeatable prices. Shop the latest
                trends today.
              </p>
            </div>
          </section>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Search + category filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 animate-fade-in-up">
          <div className="relative w-full lg:w-72">
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-soft focus:outline-none focus:ring-2 focus:ring-emerald-500 transition placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categoryOptions.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 ${
                  category === c
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-105"
                    : "bg-white border border-slate-200 text-slate-600 shadow-soft hover:border-emerald-400 hover:text-emerald-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <span
            className={`ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full ${
              live
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-500"
            }`}
            title="Product updates appear automatically when the admin makes changes"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                live ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            LIVE
          </span>
        </div>

        {/* Section title */}
        <Reveal className="mt-10 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {category === "All" ? "Featured products" : category}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filtered.length} product{filtered.length === 1 ? "" : "s"} available
            </p>
          </div>
        </Reveal>

        {/* Products */}
        {products === null ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden"
              >
                <div className="aspect-square shimmer" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                  <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                  <div className="h-5 bg-slate-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i, 11) * 50}ms` }}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </Reveal>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-slate-800">
              {search || category !== "All"
                ? "No products match your search"
                : "No products yet"}
            </h2>
            <p className="mt-2 text-slate-500">
              {search || category !== "All"
                ? "Try a different keyword or category."
                : "Load some demo products to see the store in action."}
            </p>
            {!(search || category !== "All") && (
              <>
                <button
                  onClick={seedDemo}
                  disabled={seeding}
                  className="mt-6 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {seeding ? "Loading..." : "🪄 Load demo products"}
                </button>
                {seedError && (
                  <p className="mt-3 text-sm text-rose-600">{seedError}</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
