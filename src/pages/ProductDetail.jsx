import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Volume2,
  VolumeX,
  Heart,
  ShoppingBag,
  Check,
  ChevronRight,
  ArrowLeft,
  Share2,
  Sparkles,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import {
  effectivePrice,
  formatPrice,
  isVideoUrl,
  localizedName,
  localizedDescription,
  localizedProductCategory,
} from "../lib/helpers";
import { api } from "../api/client";
import useProductsRealtime from "../hooks/useProductsRealtime";
import useSiteSettings from "../hooks/useSiteSettings";
import { useI18n } from "../i18n/I18nContext";
import { TelegramIcon, WhatsAppIcon } from "../components/SocialIcons";
import { getTelegramOrderUrl, getWhatsAppOrderUrl } from "../lib/social";

// YouTube ID parser
function getYouTubeId(url) {
  if (!url) return null;
  const m = String(url).match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return m && m[2].length === 11 ? m[2] : null;
}

/**
 * ProductDetail — Luxury Minimalist Studio Layout (Dribbble/WUDO inspired)
 * Light pink ambient tones + butter-smooth animations + image switch transitions
 */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWished: checkWished, toggleWishlist } = useWishlist();
  const { t, lang } = useI18n();
  const s = useSiteSettings();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Related products & categories
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const isWished = checkWished(product?.id);

  const waOrderUrl = getWhatsAppOrderUrl(
    s.social_whatsapp || s.whatsapp_url || s.contact_phone,
    product,
    product ? effectivePrice(product) : 0,
    selectedVariant,
    lang
  );

  const variants = Array.isArray(product?.variants) ? product.variants : [];

  useEffect(() => {
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant("");
    }
  }, [product]);

  useEffect(() => {
    api
      .getProduct(id)
      .then((p) => {
        setProduct(p);
        setQty(1);
        setActiveImage(0);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  // Load related products & categories
  useEffect(() => {
    api
      .getCategories()
      .then((cats) => setCategories(cats || []))
      .catch(() => {});

    api
      .getProducts()
      .then((all) => {
        if (!Array.isArray(all)) return;
        const currentId = String(id);
        const others = all.filter((p) => String(p.id) !== currentId && p.is_active !== false);
        setRelatedProducts(others);
      })
      .catch(() => {});
  }, [id]);

  const catMap = useMemo(
    () => Object.fromEntries((categories || []).map((c) => [c.name, c.name_km || ""])),
    [categories]
  );

  // Real-time update from admin
  useProductsRealtime(() => {
    api
      .getProduct(id)
      .then((p) => {
        setProduct(p);
        setQty((q) => Math.min(q, Math.max(1, p.stock)));
      })
      .catch((e) => {
        setProduct(null);
        setError(e.message || t("product.notFound"));
      });
  });

  // Gallery: video first, then other media
  const rawImages = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length) return product.images;
    if (product.image_url) return [product.image_url];
    return [];
  }, [product]);

  const media = useMemo(() => {
    if (!product) return [];
    const list = [];
    const seen = new Set();

    if (product.video_url && product.video_url.trim()) {
      list.push({ url: product.video_url.trim(), type: "video" });
      seen.add(product.video_url.trim());
    }

    rawImages.forEach((u) => {
      const url = (u || "").trim();
      if (url && !seen.has(url) && isVideoUrl(url)) {
        seen.add(url);
        list.push({ url, type: "video" });
      }
    });

    rawImages.forEach((u) => {
      const url = (u || "").trim();
      if (url && !seen.has(url)) {
        seen.add(url);
        list.push({ url, type: "image" });
      }
    });

    return list;
  }, [product, rawImages]);

  const activeMedia = media[activeImage] || media[0] || null;
  const activeItem = activeMedia?.url || product?.image_url || "";
  const activeIsVideo = activeMedia?.type === "video";
  const ytId = activeIsVideo ? getYouTubeId(activeItem) : null;

  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // Video Autoplay
  useEffect(() => {
    if (!activeIsVideo) return;
    const vid = videoRef.current;
    if (!vid) return;

    vid.defaultMuted = true;
    vid.muted = isMuted;

    const playVideo = () => {
      const p = vid.play();
      if (p !== undefined) {
        p.catch(() => {
          vid.muted = true;
          setIsMuted(true);
          vid.play().catch(() => {});
        });
      }
    };

    playVideo();
  }, [activeIsVideo, activeItem, isMuted]);

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in-up">
        <div className="clay-card p-10 space-y-4">
          <div className="text-6xl animate-cute-bounce">🛍️</div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{error}</h1>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl clay-nav-active font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-soft"
          >
            <span>←</span>
            <span>{t("product.backToShop")}</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 animate-pulse">
        <div className="rounded-[40px] bg-white/60 dark:bg-[#160f1c]/60 p-8 sm:p-12 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 aspect-square bg-pink-100/40 dark:bg-slate-800/40 rounded-[32px]" />
          <div className="lg:col-span-5 space-y-5">
            <div className="h-4 w-28 bg-pink-100/60 dark:bg-slate-800/40 rounded-full" />
            <div className="h-10 w-3/4 bg-pink-100/60 dark:bg-slate-800/40 rounded-2xl" />
            <div className="h-6 w-32 bg-pink-100/60 dark:bg-slate-800/40 rounded-xl" />
            <div className="h-24 bg-pink-100/60 dark:bg-slate-800/40 rounded-2xl" />
            <div className="h-12 bg-pink-100/60 dark:bg-slate-800/40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const price = effectivePrice(product);
  const originalPrice = product.original_price || (product.is_on_sale ? product.price : null);
  const onSale = (product.is_on_sale && product.sale_percent > 0) || (originalPrice && originalPrice > price);
  const salePercent = product.is_on_sale && product.sale_percent > 0
    ? Math.round(product.sale_percent)
    : originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const outOfStock = product.stock <= 0;
  const khrAmount = Math.round(price * 4100);

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const nextMute = !vid.muted;
    vid.muted = nextMute;
    setIsMuted(nextMute);
    if (!nextMute) {
      vid.play().catch(() => {});
    }
  };

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product, qty, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addItem(product, qty, selectedVariant);
    navigate("/checkout");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: localizedName(product, lang),
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const description = localizedDescription(product, lang) || t("product.noDescription");

  // Matching related products
  const matchingRelated = relatedProducts
    .filter((p) => !product.category || p.category === product.category)
    .slice(0, 4);
  const displayRelated = matchingRelated.length >= 2 ? matchingRelated : relatedProducts.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 pb-28 sm:pb-16 w-full min-w-0">
      {/* Top Breadcrumb & Minimal Navigation */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 px-1">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-pink-600 dark:text-slate-400 dark:hover:text-pink-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("product.backToShop") || "ត្រឡប់ទៅហាង"}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-all"
            title="Share"
            aria-label="Share product"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* =========================================================
          GRAND LUXURY STUDIO CARD (Split 2-Column Clean Look)
         ========================================================= */}
      <div className="rounded-[36px] sm:rounded-[44px] bg-white dark:bg-[#160f1c] shadow-2xl shadow-pink-500/5 border border-pink-100/90 dark:border-pink-950/60 overflow-hidden grid lg:grid-cols-12">
        {/* =========================================================
            LEFT COLUMN: MINIMALIST PRODUCT SHOWCASE
           ========================================================= */}
        <div className="lg:col-span-7 bg-gradient-to-b from-pink-50/70 via-pink-50/20 to-white dark:from-[#1b1022] dark:via-[#160f1c] dark:to-[#120a17] p-6 sm:p-10 flex flex-col justify-between items-center relative border-b lg:border-b-0 lg:border-r border-pink-100/80 dark:border-pink-950/60 min-h-[460px] sm:min-h-[560px]">
          {/* Top Floating Badges */}
          <div className="w-full flex items-center justify-between z-10 mb-4">
            {onSale && salePercent > 0 ? (
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-xs tracking-wide flex items-center gap-1 animate-pop-in">
                <span>🎀</span>
                <span>-{salePercent}% {t("product.off")}</span>
              </span>
            ) : (
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-pink-400 dark:text-pink-500 bg-pink-100/50 dark:bg-pink-950/50 px-3 py-1 rounded-full">
                {localizedProductCategory(product, lang) || "COLLECTION"}
              </span>
            )}

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-sm ${
                isWished
                  ? "bg-pink-500 text-white shadow-pink-500/25 scale-105"
                  : "bg-white/90 dark:bg-[#1f1425]/90 text-slate-400 hover:text-pink-500 hover:scale-110"
              }`}
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className={`w-4.5 h-4.5 stroke-[2.2] ${isWished ? "fill-white" : ""}`} />
            </button>
          </div>

          {/* Center Stage: Floating Product with Animated Switch */}
          <div className="relative w-full flex-1 flex flex-col items-center justify-center py-4 my-auto">
            {/* Soft Ambient Floating Shadow */}
            <div className="absolute bottom-6 w-2/3 max-w-[280px] h-6 bg-pink-400/20 dark:bg-pink-900/30 rounded-full blur-xl -z-10 transition-all duration-500" />

            {/* Media Item with Smooth Keyframe Transition on Image Change */}
            <div
              key={`product-media-${activeItem}-${activeImage}`}
              className="relative w-full max-w-[340px] sm:max-w-[420px] aspect-square flex items-center justify-center animate-product-switch"
            >
              {activeItem && activeIsVideo ? (
                ytId ? (
                  <div className="w-full h-full rounded-3xl overflow-hidden bg-black shadow-lg">
                    <iframe
                      key={activeItem}
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=1&playsinline=1&enablejsapi=1`}
                      title={localizedName(product, lang)}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full rounded-3xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-lg">
                    <video
                      ref={videoRef}
                      key={activeItem}
                      autoPlay
                      muted
                      loop
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    >
                      <source src={activeItem} type="video/mp4" />
                      <source src={activeItem} type="video/webm" />
                    </video>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-pink-300" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className="text-[10px]">{isMuted ? t("product.soundOff") : t("product.soundOn")}</span>
                    </button>
                  </div>
                )
              ) : activeItem ? (
                <img
                  src={activeItem}
                  alt={localizedName(product, lang)}
                  className="w-full h-full max-h-[360px] sm:max-h-[420px] object-contain transition-transform duration-500 hover:scale-105 select-none filter drop-shadow-sm"
                  loading="eager"
                />
              ) : (
                <div className="text-7xl">🛍️</div>
              )}
            </div>
          </div>

          {/* Bottom Thumbnails: Squircle Row (Matching Reference) */}
          {media.length > 1 && (
            <div className="w-full pt-4 flex items-center justify-center gap-3 overflow-x-auto scrollbar-none z-10">
              {media.map((item, i) => (
                <button
                  key={`${item.url}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[24px] overflow-hidden transition-all duration-300 active:scale-95 bg-white dark:bg-[#1a1222] p-1.5 flex items-center justify-center shrink-0 ${
                    i === activeImage
                      ? "border-2 border-pink-500 ring-4 ring-pink-100 dark:ring-pink-950/80 shadow-md shadow-pink-500/15 scale-105"
                      : "border border-pink-100/90 dark:border-pink-900/40 opacity-60 hover:opacity-100 hover:scale-102 hover:border-pink-300"
                  }`}
                  aria-label={`Thumbnail ${i + 1}`}
                >
                  {item.type === "video" ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden">
                      <span className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center text-white">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current ml-0.5">
                          <polygon points="6 3 20 12 6 21 6 3" />
                        </svg>
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================
            RIGHT COLUMN: ULTRA CLEAN LUXURY DETAILS
           ========================================================= */}
        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Eyebrow Category */}
          <p className="text-[11px] sm:text-xs font-black tracking-[0.2em] uppercase text-pink-500 dark:text-pink-400">
            {localizedProductCategory(product, lang) || "PREMIUM QUALITY"}
          </p>

          {/* Product Title */}
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {localizedName(product, lang)}
          </h1>

          {/* Rating & Stock Line */}
          <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {product.rating ? Number(product.rating).toFixed(1) : "5.0"}
              </span>
            </div>
            <span>·</span>
            <span>{t("product.topRated") || "Top Rated"}</span>
            <span>·</span>
            {outOfStock ? (
              <span className="text-rose-500 font-bold">{t("product.outOfStock")}</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>{t("product.inStock")} ({product.stock})</span>
              </span>
            )}
          </div>

          {/* Color / Variant Swatches (if available) */}
          {variants.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                {t("product.selectType")}: <span className="text-slate-900 dark:text-white font-extrabold">{selectedVariant}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                  const isSelected = selectedVariant === variant;
                  return (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 ${
                        isSelected
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm scale-102"
                          : "bg-pink-50/70 dark:bg-[#1f1425] text-slate-700 dark:text-slate-300 border border-pink-100 dark:border-pink-900/40 hover:border-pink-300"
                      }`}
                    >
                      {variant}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed font-normal">
            {description}
          </p>

          {/* Clean Specs & Guarantee Strip (Reference Table Style) */}
          <div className="my-6 py-3.5 border-y border-pink-100 dark:border-pink-950/60 grid grid-cols-3 gap-2 text-center">
            <div className="px-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                {t("trust.deliveryTitle") || "Delivery"}
              </p>
              <p className="text-xs font-extrabold text-slate-800 dark:text-pink-100 mt-0.5">
                ២៥ ខេត្ត-ក្រុង
              </p>
            </div>
            <div className="px-2 border-x border-pink-100 dark:border-pink-950/60">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                {t("trust.qualityTitle") || "Authentic"}
              </p>
              <p className="text-xs font-extrabold text-slate-800 dark:text-pink-100 mt-0.5">
                សុទ្ធ ១០០%
              </p>
            </div>
            <div className="px-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                {t("trust.khqrTitle") || "Payment"}
              </p>
              <p className="text-xs font-extrabold text-slate-800 dark:text-pink-100 mt-0.5">
                KHQR Pay
              </p>
            </div>
          </div>

          {/* Price Row */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-lg text-slate-400 line-through font-semibold">
                {formatPrice(originalPrice)}
              </span>
            )}
            {onSale && salePercent > 0 && (
              <span className="bg-pink-100 dark:bg-pink-950/70 text-pink-600 dark:text-pink-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                -{salePercent}%
              </span>
            )}
            <span className="text-xs font-medium text-slate-400">
              ≈ {khrAmount.toLocaleString()} ៛
            </span>
          </div>

          {/* Stepper (Minimalist Box from Reference) */}
          <div className="mt-4 flex items-center gap-3">
            <div className="inline-flex items-center rounded-xl border border-pink-200 dark:border-pink-900/60 bg-white dark:bg-[#1a1222] p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-9 text-center text-sm font-extrabold text-slate-800 dark:text-white tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={outOfStock}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Dual Action Buttons Row (ADD TO CART + BUY NOW) */}
          <div className="mt-5 flex items-center gap-3">
            {/* White Add to Cart Button */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex-1 h-12 sm:h-13 px-4 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-95 border-2 ${
                added
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-white dark:bg-[#1a1222] border-pink-200 dark:border-pink-800 text-slate-800 dark:text-white hover:border-pink-400 shadow-2xs hover:shadow-soft"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {added ? "✓ បានដាក់រួច" : "ADD TO CART"}
            </button>

            {/* Solid Dark Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="flex-1 h-12 sm:h-13 px-4 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-lg shadow-slate-900/15 dark:shadow-white/10 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>BUY NOW</span>
            </button>
          </div>

          {/* Quick Chat Order Option */}
          <div className="mt-5 pt-4 border-t border-pink-100/80 dark:border-pink-950/40 flex items-center justify-between gap-2.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ឆាតកុម្ម៉ង់ផ្ទាល់:
            </span>
            <div className="flex items-center gap-2">
              <a
                href={getTelegramOrderUrl(s.social_telegram || s.telegram_url, product, price, selectedVariant, lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[#229ED9] hover:bg-[#229ED9] hover:text-white border border-sky-200/80 dark:border-sky-900/40 font-bold transition-all active:scale-95 text-[11px]"
              >
                <TelegramIcon className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>
              {waOrderUrl && (
                <a
                  href={waOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-emerald-200/80 dark:border-emerald-900/40 font-bold transition-all active:scale-95 text-[11px]"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          YOU MAY ALSO LIKE / RELATED PRODUCTS
         ========================================================= */}
      {displayRelated.length > 0 && (
        <div className="mt-14 sm:mt-20 pt-10 border-t border-pink-100/80 dark:border-pink-950/60">
          <div className="flex items-center justify-between mb-6 sm:mb-8 px-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>🌸</span>
                <span>{t("home.featured") || "You May Also Like"}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t("home.browseAll") || "Discover more products"}
              </p>
            </div>
            <Link
              to="/"
              className="text-xs sm:text-sm font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
            >
              <span>{t("home.all") || "View all"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayRelated.map((p) => (
              <ProductCard key={p.id} product={p} catMap={catMap} />
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          MOBILE STICKY BUY BAR
         ========================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#160f1c]/95 backdrop-blur-xl border-t border-pink-100 dark:border-pink-950 p-3 shadow-2xl flex items-center justify-between gap-2.5 animate-fade-in-up">
        <div className="min-w-0">
          <p className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">
            {formatPrice(price)}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate max-w-[120px]">
            {localizedName(product, lang)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className={`px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-800 text-slate-800 dark:text-white text-xs font-bold ${
              added ? "bg-emerald-500 text-white border-emerald-500" : "bg-white dark:bg-[#1a1222]"
            }`}
          >
            {added ? "✓" : "CART"}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs shadow-md"
          >
            BUY NOW
          </button>
        </div>
      </div>
    </div>
  );
}
