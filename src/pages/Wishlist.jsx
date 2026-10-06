import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingBag, ArrowLeft, Sparkles, Check } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nContext";
import { api } from "../api/client";
import { useRealtime } from "../context/RealtimeContext";

/**
 * Wishlist / Liked Products Page
 * Displays all products that the user has marked as favorite with the heart button.
 */
export default function Wishlist() {
  const { wishlistIds, cachedItems, count, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { t, lang } = useI18n();

  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [addedAll, setAddedAll] = useState(false);

  // Load products and categories from backend
  const loadProducts = useCallback(() => {
    api
      .getProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const loadCategories = useCallback(() => {
    api
      .getCategories()
      .then((cats) => setCategories(cats || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  // Real-time updates when admin updates products
  useRealtime("products_changed", loadProducts);

  const catMap = useMemo(
    () => Object.fromEntries((categories || []).map((c) => [c.name, c.name_km || ""])),
    [categories]
  );

  // Merge loaded products with wishlist IDs (fallback to cached items if products not loaded yet)
  const likedProducts = useMemo(() => {
    if (!wishlistIds.length) return [];

    if (Array.isArray(products) && products.length > 0) {
      const pMap = new Map(products.map((p) => [String(p.id), p]));
      return wishlistIds
        .map((id) => pMap.get(String(id)))
        .filter(Boolean);
    }

    // Fallback to cached items
    const cMap = new Map((cachedItems || []).map((p) => [String(p.id), p]));
    return wishlistIds
      .map((id) => cMap.get(String(id)))
      .filter(Boolean);
  }, [wishlistIds, products, cachedItems]);

  const handleAddAllToCart = () => {
    const inStockItems = likedProducts.filter((p) => (Number(p.stock) || 0) > 0);
    if (!inStockItems.length) return;
    inStockItems.forEach((p) => addItem(p));
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  const handleClearAll = () => {
    if (window.confirm(t("wishlist.clearConfirm") || "Are you sure you want to remove all liked items?")) {
      clearWishlist();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10">
      {/* Top Breadcrumb & Back */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("wishlist.continueShopping")}</span>
        </Link>

        {likedProducts.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t("wishlist.itemCount", { count: likedProducts.length })}
          </span>
        )}
      </div>

      {/* Header Banner */}
      <div className="relative mb-8 p-6 sm:p-8 rounded-[28px] bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 border border-pink-200/60 dark:border-pink-900/40 backdrop-blur-md overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-[#1f1325] shadow-md shadow-pink-500/10 flex items-center justify-center shrink-0 border border-pink-100 dark:border-pink-900/40">
              <Heart className="w-7 h-7 text-pink-500 fill-pink-500 animate-heartbeat" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {t("wishlist.title")}
                </h1>
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  {count}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t("wishlist.subtitle")}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {likedProducts.length > 0 && (
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white text-xs font-bold shadow-md hover:shadow-lg hover:scale-103 active:scale-97 transition-all"
              >
                {addedAll ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t("common.saved") || "Added!"}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t("wishlist.addAllToCart")}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1 px-3 py-2.5 rounded-2xl bg-white/80 dark:bg-[#1a1424]/80 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/80 dark:border-slate-800 text-xs font-bold transition-all hover:scale-103 active:scale-97"
                title={t("wishlist.clearAll")}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t("wishlist.clearAll")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {likedProducts.length === 0 ? (
        <div className="max-w-md mx-auto py-12 px-4 text-center animate-fade-in-up">
          <div className="clay-card p-8 sm:p-12 space-y-4">
            <div className="text-6xl animate-cute-bounce">💖</div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
              {t("wishlist.empty")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-purple-300/80 font-medium leading-relaxed">
              {t("wishlist.emptyHint")}
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl clay-nav-active font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-soft"
              >
                <span>🌸</span>
                <span>{t("wishlist.continueShopping")}</span>
                <span>✨</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-fade-in">
          {likedProducts.map((p) => (
            <ProductCard key={p.id} product={p} catMap={catMap} />
          ))}
        </div>
      )}
    </div>
  );
}
