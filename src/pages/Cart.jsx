import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/helpers";
import { useI18n } from "../i18n/I18nContext";
import { api } from "../api/client";
import { useRealtime } from "../context/RealtimeContext";

/** Cart — កន្ត្រកទំនិញ (Clean & Cute Girl UI + Dynamic Free shipping milestone) */
export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, count } = useCart();
  const { t } = useI18n();

  // Dynamic delivery milestones from backend API
  const [milestones, setMilestones] = useState(null);

  const loadMilestones = useCallback(() => {
    api
      .getMilestones()
      .then(setMilestones)
      .catch(() => setMilestones([]));
  }, []);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  // Real-time: Admin creates, edits, deletes, or toggles Hide/Show milestone -> updates immediately
  useRealtime("milestones_changed", loadMilestones);

  // Find the active milestone for Cart display
  const cartMilestones = (milestones || []).filter(
    (m) => m.is_active !== false && m.show_on_cart !== false
  );

  const activeMilestone =
    cartMilestones.find((m) => m.threshold > subtotal) ||
    cartMilestones[cartMilestones.length - 1] ||
    null;

  const threshold = activeMilestone ? activeMilestone.threshold : 0;
  const progressPercent = threshold > 0 ? Math.min(100, Math.round((subtotal / threshold) * 100)) : 0;
  const remaining = threshold > 0 ? Math.max(0, threshold - subtotal) : 0;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in-up">
        <div className="text-6xl mb-4 animate-cute-bounce">🛍️</div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-pink-100">{t("cart.empty")}</h1>
        <p className="mt-2 text-pink-600/80 dark:text-pink-300/80 font-semibold">{t("cart.emptyHint")}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-cute-glow"
        >
          <span>🌸</span>
          <span>{t("cart.continueShopping")}</span>
          <span>💖</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-12">
      {/* Title & Badge */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-pink-100 flex items-center gap-2">
          <span>🛍️ {t("cart.title")}</span>
          <span className="text-sm font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-3 py-1 rounded-full border border-pink-200 dark:border-pink-900">
            {t("cart.itemsCount", { count })}
          </span>
        </h1>
      </div>

      {/* Free Delivery Milestone Progress Meter (Can Hide & Show via Admin + Real-time) */}
      {activeMilestone && (
        <div className="mt-4 p-4 rounded-3xl bg-white/90 dark:bg-[#1A1220]/90 border border-pink-200/70 dark:border-pink-900/50 shadow-marshmallow animate-fade-in">
          <div className="flex items-center justify-between text-xs sm:text-sm font-black mb-2">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-pink-100">
              {remaining > 0 ? (
                <>
                  <span>{activeMilestone.icon || "🎁"}</span>
                  <span>
                    Add <span className="text-pink-600 dark:text-pink-400 font-extrabold">{formatPrice(remaining)}</span> more for {activeMilestone.title || "Free Sweet Delivery & Gift!"}
                  </span>
                </>
              ) : (
                <>
                  <span>{activeMilestone.unlocked_icon || "🎉"}</span>
                  <span className="text-pink-600 dark:text-pink-300">
                    {activeMilestone.reward_text || "Yay! You unlocked Free Sweet Delivery & Gift! 🎁✨"}
                  </span>
                </>
              )}
            </span>
            <span className="text-xs font-black text-pink-500">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-pink-100/70 dark:bg-[#130D18] rounded-full overflow-hidden p-0.5 border border-pink-200/50 dark:border-pink-950">
            <div
              className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-full transition-all duration-500 shadow-cute-glow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}


      <div className="mt-6 sm:mt-8 grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item, i) => (
            <div
              key={`${item.id}-${item.variant || "default"}`}
              className="flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-[#1A1220] border border-pink-100/90 dark:border-pink-950/60 shadow-marshmallow card-hover will-change-transform animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}
            >
              <Link
                to={`/product/${item.id}`}
                className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-pink-50/40 dark:bg-[#130D18] group"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-slate-400">
                    🛍️
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      to={`/product/${item.id}`}
                      className="font-black text-slate-800 dark:text-pink-100 hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200 line-clamp-1 text-sm sm:text-base"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <span className="inline-block mt-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 dark:bg-pink-950/80 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                        🎀 {item.variant}
                      </span>
                    )}
                    <p className="text-xs sm:text-sm font-bold text-pink-600 dark:text-pink-400 mt-0.5">
                      {formatPrice(item.price)} {t("cart.each")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id, item.variant)}
                    className="text-pink-300 hover:text-rose-500 transition-all duration-200 text-sm font-bold active:scale-90 p-1"
                    aria-label={t("cart.remove")}
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-pink-200/80 dark:border-pink-900/50 rounded-full overflow-hidden bg-pink-50/40 dark:bg-[#130D18]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                      className="px-3 py-1 font-black text-pink-600 dark:text-pink-300 hover:bg-pink-100/60 dark:hover:bg-pink-950/40 transition-colors duration-200 active:scale-90"
                      aria-label={t("product.decrease")}
                    >
                      −
                    </button>
                    <span className="px-3 py-1 font-black min-w-8 text-center border-x border-pink-100 dark:border-pink-950/80 text-slate-800 dark:text-pink-100 tabular-nums text-xs sm:text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                      className="px-3 py-1 font-black text-pink-600 dark:text-pink-300 hover:bg-pink-100/60 dark:hover:bg-pink-950/40 transition-colors duration-200 active:scale-90"
                      aria-label={t("product.increase")}
                    >
                      +
                    </button>
                  </div>
                  <p className="font-black text-base sm:text-lg text-slate-900 dark:text-pink-100">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div
          className="bg-white dark:bg-[#1A1220] rounded-3xl border border-pink-100/90 dark:border-pink-950/60 shadow-marshmallow p-6 h-fit lg:sticky lg:top-24 animate-fade-in-up transition-all duration-300 hover:shadow-cute-glow"
          style={{ animationDelay: "150ms" }}
        >
          <h2 className="text-lg font-black text-slate-900 dark:text-pink-100 flex items-center gap-1.5">
            <span>🎀</span>
            <span>{t("cart.orderSummary")}</span>
          </h2>
          <div className="mt-4 space-y-2.5 text-sm font-semibold">
            <div className="flex justify-between text-slate-600 dark:text-pink-200/80">
              <span>{t("cart.subtotal", { count })}</span>
              <span className="font-bold text-slate-900 dark:text-pink-100">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-pink-200/80">
              <span>{t("cart.shipping")}</span>
              <span className="text-pink-600 dark:text-pink-400 font-black">
                🌸 {t("cart.free")}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-pink-100 dark:border-pink-950/80 flex justify-between text-lg font-black text-slate-900 dark:text-pink-100">
            <span>{t("cart.total")}</span>
            <span className="text-pink-600 dark:text-pink-400 text-xl">{formatPrice(subtotal)}</span>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block w-full text-center px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-black transition-all duration-200 hover:scale-102 active:scale-[0.98] shadow-cute-glow text-sm sm:text-base"
          >
            💖 {t("cart.checkout")} ✨
          </Link>
          <Link
            to="/"
            className="mt-3 block w-full text-center px-6 py-3 rounded-full border border-pink-200 dark:border-pink-900/60 text-slate-700 dark:text-pink-200 font-bold transition-all duration-200 hover:bg-pink-50/60 dark:hover:bg-pink-950/40 active:scale-[0.98] text-sm"
          >
            🌸 {t("cart.continueShopping")}
          </Link>

          <p className="mt-4 text-center text-xs font-semibold text-pink-400/80">
            🏦 {t("footer.payWith")}
          </p>
        </div>
      </div>
    </div>
  );
}
