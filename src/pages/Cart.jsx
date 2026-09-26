import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice, localizedName } from "../lib/helpers";
import { useI18n } from "../i18n/I18nContext";
import { api } from "../api/client";
import { useRealtime } from "../context/RealtimeContext";
import { CheckmarkBox3D } from "../components/ClayIcons";

/** Cart — 3D Claymorphic Cart (Matched with Frontend-Admin) */
export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, count } = useCart();
  const { t, lang } = useI18n();

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
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in-up">
        <div className="clay-card p-10 sm:p-14 space-y-4">
          <div className="text-6xl animate-cute-bounce">🛍️</div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">{t("cart.empty")}</h1>
          <p className="text-sm text-slate-500 dark:text-purple-300/80 font-medium">{t("cart.emptyHint")}</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl clay-nav-active font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-soft"
          >
            <span>🌸</span>
            <span>{t("cart.continueShopping")}</span>
            <span>💖</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-12 font-sans">
      {/* Title & Badge */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <span>🛍️ {t("cart.title")}</span>
          <span className="text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-900 shadow-2xs">
            {t("cart.itemsCount", { count })}
          </span>
        </h1>
      </div>

      {/* Free Delivery Milestone Progress Meter */}
      {activeMilestone && (
        <div className="mt-4 p-4 rounded-2xl clay-card-purple animate-fade-in">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-2">
            <span className="flex items-center gap-2 text-slate-800 dark:text-purple-100">
              {remaining > 0 ? (
                <>
                  <span className="text-base">{activeMilestone.icon || "🎁"}</span>
                  <span>
                    {lang === "km" ? (
                      <>
                        ថែម <span className="text-purple-700 dark:text-purple-300 font-black">{formatPrice(remaining)}</span> ទៀត ដើម្បីទទួលបាន {activeMilestone.title_km || activeMilestone.title || t("milestone.freeGift")}
                      </>
                    ) : (
                      <>
                        Add <span className="text-purple-700 dark:text-purple-300 font-black">{formatPrice(remaining)}</span> more for {activeMilestone.title || activeMilestone.title_km || t("milestone.freeGift")}
                      </>
                    )}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base">{activeMilestone.unlocked_icon || "🎉"}</span>
                  <span className="text-purple-700 dark:text-purple-300 font-black">
                    {lang === "km"
                      ? activeMilestone.reward_text_km || activeMilestone.reward_text || t("milestone.allUnlocked")
                      : activeMilestone.reward_text || activeMilestone.reward_text_km || t("milestone.allUnlocked")}
                  </span>
                </>
              )}
            </span>
            <span className="text-xs font-black text-purple-700 dark:text-purple-300">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-white/70 dark:bg-[#120e1a] rounded-full overflow-hidden p-0.5 border border-purple-200/50 dark:border-purple-900/40">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full transition-all duration-500 shadow-soft"
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
              className="flex items-center gap-4 p-4 sm:p-5 rounded-[26px] clay-card card-hover will-change-transform animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}
            >
              <Link
                to={`/product/${item.id}`}
                className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-purple-50/40 dark:bg-[#120e1a] group"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={localizedName(item, lang)}
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
                      className="font-black text-slate-800 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 line-clamp-1 text-sm sm:text-base"
                    >
                      {localizedName(item, lang)}
                    </Link>
                    {item.variant && (
                      <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        🎀 {item.variant}
                      </span>
                    )}
                    <p className="text-xs sm:text-sm font-black text-purple-700 dark:text-purple-300 mt-0.5">
                      {formatPrice(item.price)} {t("cart.each")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id, item.variant)}
                    className="clay-circle-btn w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all text-xs font-bold active:scale-90"
                    aria-label={t("cart.remove")}
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-purple-200/80 dark:border-purple-900/50 rounded-2xl overflow-hidden bg-white dark:bg-[#120e1a] p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                      className="w-7 h-7 flex items-center justify-center font-black text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors duration-200 active:scale-90"
                      aria-label={t("product.decrease")}
                    >
                      −
                    </button>
                    <span className="px-3 py-0.5 font-black min-w-8 text-center text-slate-800 dark:text-purple-100 tabular-nums text-xs sm:text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                      className="w-7 h-7 flex items-center justify-center font-black text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors duration-200 active:scale-90"
                      aria-label={t("product.increase")}
                    >
                      +
                    </button>
                  </div>
                  <p className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div
          className="clay-card p-6 h-fit lg:sticky lg:top-24 animate-fade-in-up"
          style={{ animationDelay: "150ms" }}
        >
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 pb-4 border-b border-purple-100 dark:border-purple-900/40">
            <span>🎀</span>
            <span>{t("cart.orderSummary")}</span>
          </h2>
          <div className="mt-4 space-y-2.5 text-sm font-semibold">
            <div className="flex justify-between text-slate-600 dark:text-purple-200/80">
              <span>{t("cart.subtotal", { count })}</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-purple-200/80">
              <span>{t("cart.shipping")}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                🌸 {t("cart.free")}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-900/40 flex justify-between text-lg font-black text-slate-800 dark:text-white">
            <span>{t("cart.total")}</span>
            <span className="text-purple-700 dark:text-purple-300 text-xl">{formatPrice(subtotal)}</span>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block w-full text-center px-6 py-3.5 rounded-2xl clay-nav-active font-bold transition-all duration-200 hover:scale-102 active:scale-[0.98] shadow-soft text-sm sm:text-base text-white"
          >
            💖 {t("cart.checkout")} ✨
          </Link>
          <Link
            to="/"
            className="mt-3 block w-full text-center px-6 py-3 rounded-2xl clay-circle-btn text-slate-700 dark:text-purple-200 font-bold transition-all duration-200 active:scale-[0.98] text-sm"
          >
            🌸 {t("cart.continueShopping")}
          </Link>

          <p className="mt-4 text-center text-xs font-semibold text-purple-400/80">
            🏦 {t("footer.payWith")}
          </p>
        </div>
      </div>
    </div>
  );
}
