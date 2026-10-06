import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, X } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useI18n } from "../i18n/I18nContext";
import { localizedName } from "../lib/helpers";

export default function WishlistToast() {
  const { toastMessage, dismissToast } = useWishlist();
  const { t, lang } = useI18n();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastMessage, dismissToast]);

  if (!toastMessage) return null;

  const { type, product } = toastMessage;
  const isAdd = type === "added";

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[92vw] sm:max-w-md w-full animate-fade-in-up">
      <div className="mx-auto flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-[#1f142b]/95 backdrop-blur-xl border border-pink-300/60 dark:border-pink-900/60 shadow-xl shadow-pink-500/10">
        <div className="flex items-center gap-2.5 min-w-0">
          {product?.image_url ? (
            <img
              src={product.image_url}
              alt=""
              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-pink-200/60 dark:border-pink-950/80 shadow-2xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/60 flex items-center justify-center text-lg shrink-0">
              💖
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {product ? localizedName(product, lang) : ""}
            </p>
            <p className="text-[11px] font-medium text-pink-600 dark:text-pink-300 flex items-center gap-1">
              <Heart className={`w-3 h-3 ${isAdd ? "fill-pink-500 text-pink-500" : "text-slate-400"}`} />
              <span>{isAdd ? t("wishlist.addedToast") : t("wishlist.removedToast")}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdd && (
            <Link
              to="/wishlist"
              onClick={dismissToast}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <span>{t("wishlist.viewWishlist") || "View"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          <button
            type="button"
            onClick={dismissToast}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label={t("common.close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
