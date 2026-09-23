import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Check, Play, Star, Eye, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { effectivePrice, formatPrice } from "../lib/helpers";
import { useI18n } from "../i18n/I18nContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { t } = useI18n();
  const [justAdded, setJustAdded] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const price = effectivePrice(product);
  const outOfStock = product.stock <= 0;
  const onSale = product.is_on_sale && product.sale_percent > 0;

  // Check wishlist in localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("udom_wishlist") || "[]");
      setIsWished(saved.includes(product.id));
    } catch {
      /* ignore */
    }
  }, [product.id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 800);

    try {
      const saved = JSON.parse(localStorage.getItem("udom_wishlist") || "[]");
      let next;
      if (saved.includes(product.id)) {
        next = saved.filter((id) => id !== product.id);
        setIsWished(false);
      } else {
        next = [...saved, product.id];
        setIsWished(true);
      }
      localStorage.setItem("udom_wishlist", JSON.stringify(next));
    } catch {
      setIsWished((v) => !v);
    }
  };

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
    <div className="group relative bg-white dark:bg-[#1A1220] rounded-[28px] border border-pink-100/90 dark:border-pink-950/60 shadow-marshmallow hover:shadow-cute-glow card-hover flex flex-col overflow-hidden will-change-transform">
      {/* Image container with rounded inner border */}
      <div className="p-2 pb-0">
        <Link
          to={`/product/${product.id}`}
          className="relative block aspect-square rounded-[22px] bg-pink-50/40 dark:bg-[#130D18] overflow-hidden"
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
          <div className="absolute inset-0 bg-gradient-to-t from-pink-950/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Cute Sticker Pill */}
          {onSale ? (
            <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full shadow-cute-glow animate-pop-in tracking-wide flex items-center gap-1">
              <span>🎀</span>
              <span>-{Math.round(product.sale_percent)}% OFF</span>
            </div>
          ) : (
            <div className="absolute top-2.5 left-2.5 bg-white/90 dark:bg-[#1A1220]/90 text-pink-600 dark:text-pink-300 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs backdrop-blur-md border border-pink-100 dark:border-pink-950/80 flex items-center gap-1">
              <span>✨</span>
              <span>{t("product.cutePick")}</span>
            </div>
          )}

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={isWished ? t("common.wishlistRemove") : t("common.wishlistAdd")}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 active:scale-90 shadow-xs z-10 ${
              isWished
                ? "bg-rose-500 text-white shadow-rose-500/30"
                : "bg-white/85 dark:bg-[#1A1220]/85 text-pink-400 hover:text-rose-500 hover:bg-white border border-pink-200/60 dark:border-pink-900/60"
            } ${heartAnim ? "animate-heartbeat" : ""}`}
          >
            <Heart
              className={`w-4 h-4 ${isWished ? "fill-white" : "hover:scale-110"}`}
            />
          </button>

          {/* Stock badge */}
          {outOfStock && (
            <span className="absolute bottom-2.5 left-2.5 bg-slate-900/85 text-pink-100 text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
              {t("product.soldOut")}
            </span>
          )}

          {/* Video badge */}
          {product.video_url && (
            <span className="absolute bottom-2.5 right-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md backdrop-blur-md flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-current" />
              VIDEO
            </span>
          )}

          {/* Quick view button on hover */}
          <div className="absolute bottom-3 inset-x-3 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 bg-white/95 dark:bg-[#1A1220]/95 text-pink-600 dark:text-pink-200 text-xs font-black px-3.5 py-1.5 rounded-full shadow-marshmallow backdrop-blur-md border border-pink-200/60 dark:border-pink-900/60">
              <Eye className="w-3.5 h-3.5" />
              <span>{t("product.viewDetails")} 🌸</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Product info */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2">
          {product.category ? (
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 border border-pink-200/50 dark:border-pink-900/50 px-2 py-0.5 rounded-full truncate">
              🌸 {product.category}
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1 text-amber-500 text-xs font-black bg-amber-50/60 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/50">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating ? Number(product.rating).toFixed(1) : "5.0"}</span>
          </div>
        </div>

        <Link
          to={`/product/${product.id}`}
          className="mt-2 font-black text-slate-800 dark:text-pink-100 line-clamp-2 leading-snug hover:text-pink-600 dark:hover:text-pink-400 transition-colors text-xs sm:text-base"
        >
          {product.name}
        </Link>

        {/* Price and Cart button */}
        <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-base sm:text-xl font-black text-pink-600 dark:text-pink-300 tracking-tight">
                {formatPrice(price)}
              </span>
              {onSale ? (
                <span className="text-[11px] sm:text-sm text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              ) : product.original_price && product.original_price > price ? (
                <span className="text-[11px] sm:text-sm text-slate-400 dark:text-slate-500 line-through">
                  {formatPrice(product.original_price)}
                </span>
              ) : null}
            </div>
            <p className="text-[10px] sm:text-[11px] text-pink-400/80 dark:text-pink-400/60 font-semibold truncate">
              ~{khrAmount.toLocaleString()} ៛
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={outOfStock ? t("product.soldOut") : t("product.addToCart")}
            className={`relative flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 shadow-xs shrink-0 ripple-container ${
              justAdded
                ? "bg-rose-500 text-white shadow-rose-500/40 scale-105 animate-spring-pop"
                : "bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white shadow-cute-glow hover:scale-105"
            } disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed disabled:active:scale-100`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span className="text-xs">{t("product.addedCute")}</span>
              </>
            ) : outOfStock ? (
              <span className="text-xs">{t("product.soldOut")}</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:inline">{t("common.add")} 🛍️</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
