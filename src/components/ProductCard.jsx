import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Check, Play, Star, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";
import { effectivePrice, formatPrice } from "../lib/helpers";
import { useI18n } from "../i18n/I18nContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { t } = useI18n();
  const [justAdded, setJustAdded] = useState(false);
  const price = effectivePrice(product);
  const outOfStock = product.stock <= 0;
  const onSale = product.is_on_sale && product.sale_percent > 0;

  // Approximate KHR price (standard 4,100 KHR / USD rate)
  const khrAmount = Math.round(price * 4100);

  const handleAdd = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (outOfStock) return;
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden">
      {/* Image container */}
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🛍️
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Sale badge */}
        {onSale && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-lg shadow-rose-600/30 animate-pop-in tracking-wide">
            -{Math.round(product.sale_percent)}%
          </div>
        )}

        {/* Stock badge */}
        {outOfStock && (
          <span className="absolute top-3 right-3 bg-slate-900/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
            {t("product.soldOut")}
          </span>
        )}

        {/* Video badge */}
        {product.video_url && (
          <span className="absolute bottom-3 right-3 bg-emerald-600/95 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md backdrop-blur-md flex items-center gap-1">
            <Play className="w-3 h-3 fill-current" />
            VIDEO
          </span>
        )}

        {/* Quick view button on hover */}
        <div className="absolute bottom-3 inset-x-3 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-slate-200/60 dark:border-slate-700">
            <Eye className="w-3.5 h-3.5" />
            {t("product.viewDetails")}
          </span>
        </div>
      </Link>

      {/* Product info */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2">
          {product.category ? (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md truncate">
              {product.category}
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
            <Star className="w-3 h-3 fill-current" />
            <span>4.9</span>
          </div>
        </div>

        <Link
          to={`/product/${product.id}`}
          className="mt-1.5 sm:mt-2 font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-xs sm:text-base"
        >
          {product.name}
        </Link>

        {/* Price and Cart button */}
        <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatPrice(price)}
              </span>
              {onSale && (
                <span className="text-[11px] sm:text-sm text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
              ~{khrAmount.toLocaleString()} ៛
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={outOfStock ? t("product.soldOut") : t("product.addToCart")}
            className={`relative flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 shadow-sm shrink-0 ${
              justAdded
                ? "bg-emerald-600 text-white shadow-emerald-600/30 scale-105"
                : "bg-slate-900 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:shadow-md"
            } disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed disabled:active:scale-100`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span className="text-xs">{t("product.addedShort")}</span>
              </>
            ) : outOfStock ? (
              <span className="text-xs">{t("product.soldOut")}</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:inline">{t("common.add")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
