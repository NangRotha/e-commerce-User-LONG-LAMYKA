import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { useCart } from "../context/CartContext";
import { effectivePrice, formatPrice, isVideoUrl } from "../lib/helpers";
import { api } from "../api/client";
import useProductsRealtime from "../hooks/useProductsRealtime";
import useSiteSettings from "../hooks/useSiteSettings";
import { useI18n } from "../i18n/I18nContext";
import { TelegramIcon, FacebookIcon, WhatsAppIcon } from "../components/SocialIcons";
import { getTelegramOrderUrl, getWhatsAppOrderUrl, normalizeFacebook } from "../lib/social";

// YouTube ID parser
function getYouTubeId(url) {
  if (!url) return null;
  const m = String(url).match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return m && m[2].length === 11 ? m[2] : null;
}

/** Product Detail (i18n km/en + animation + real-time update) */
export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { t } = useI18n();
  const s = useSiteSettings();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const waOrderUrl = getWhatsAppOrderUrl(
    s.social_whatsapp || s.whatsapp_url || s.contact_phone,
    product,
    product ? effectivePrice(product) : 0,
    selectedVariant
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

  // Real-time: ពេល Admin កែផលិតផលនេះ -> ទាញទិន្នន័យថ្មីមកបង្ហាញភ្លាមៗ
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in-up">
        <div className="text-5xl mb-4 animate-float">😕</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{error}</h1>
        <Link
          to="/"
          className="mt-4 inline-block text-pink-600 dark:text-pink-400 font-medium hover:underline"
        >
          {t("product.backToShop")}
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 animate-pulse">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const price = effectivePrice(product);
  const onSale = product.is_on_sale && product.sale_percent > 0;
  const outOfStock = product.stock <= 0;
  const images =
    product.images && product.images.length
      ? product.images
      : product.image_url
      ? [product.image_url]
      : [];
  // Gallery = វីដេអូបង្ហាញមុនគេបង្អស់ (បើមាន) + រូបភាពទាំងអស់
  const media = [
    ...(product.video_url ? [{ url: product.video_url, type: "video" }] : []),
    ...images.map((url) => ({
      url,
      type: isVideoUrl(url) ? "video" : "image",
    })),
  ];
  const activeMedia = media[activeImage] || null;
  const activeItem = activeMedia?.url || product.image_url;
  const activeIsVideo = activeMedia?.type === "video";
  const ytId = activeIsVideo ? getYouTubeId(activeItem) : null;

  const handleAdd = () => {
    addItem(product, qty, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-12 w-full min-w-0 max-w-full">
      <Link
        to="/"
        className="text-sm text-slate-500 hover:text-pink-600 transition-colors duration-200"
      >
        {t("product.backToShop")}
      </Link>

      <div className="mt-6 grid md:grid-cols-2 gap-8 lg:gap-14 w-full min-w-0 max-w-full">
        {/* Image gallery (Main + supporting) */}
        <div className="animate-fade-in w-full min-w-0 max-w-full overflow-hidden">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-pink-100/80 dark:border-pink-950/60 shadow-soft overflow-hidden group">
            {activeItem && activeIsVideo ? (
              ytId ? (
                <div className="w-full aspect-square bg-black">
                  <iframe
                    key={activeItem}
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=1&playsinline=1`}
                    title={product.name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                  {/* Ambient backdrop to eliminate stark black voids on portrait/vertical videos */}
                  <video
                    src={activeItem}
                    poster={product.image_url || undefined}
                    aria-hidden="true"
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                  />
                  <video
                    key={activeItem}
                    src={activeItem}
                    poster={product.image_url || undefined}
                    autoPlay
                    muted
                    loop
                    controls
                    playsInline
                    preload="auto"
                    ref={(el) => {
                      if (el) {
                        el.defaultMuted = true;
                        el.muted = true;
                        el.play().catch(() => {});
                      }
                    }}
                    className="relative z-10 w-full h-full object-contain"
                  />
                </div>
              )
            ) : activeItem ? (
              <img
                key={activeItem}
                src={activeItem}
                alt={product.name}
                className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-7xl text-slate-400">
                📦
              </div>
            )}
          </div>

          {media.length > 1 && (
            <div className="mt-3 sm:mt-4 flex gap-2.5 sm:gap-3 overflow-x-auto w-full max-w-full pb-1 scrollbar-none snap-x touch-pan-x">
              {media.map((item, i) => (
                <button
                  key={`${item.url}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative shrink-0 snap-start w-15 h-15 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-200 active:scale-95 ${
                    i === activeImage
                      ? "border-pink-500 ring-2 ring-pink-200 dark:ring-pink-900 shadow-md"
                      : "border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`${product.name} — ${i + 1}`}
                >
                  {item.type === "video" ? (
                    <>
                      {/* វីដេអូ: បង្ហាញរូបមេ + Icon Play + VIDEO Badge */}
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt=""
                          className="w-full h-full object-cover opacity-70"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500" />
                      )}
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center shadow-md">
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3.5 h-3.5 fill-current ml-0.5"
                            aria-hidden="true"
                          >
                            <polygon points="6 3 20 12 6 21 6 3" />
                          </svg>
                        </span>
                      </span>
                      <span className="absolute bottom-0.5 right-0.5 text-[9px] font-black tracking-wider uppercase px-1 py-0.5 bg-pink-600 text-white rounded">
                        VIDEO
                      </span>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div
          className="flex flex-col animate-fade-in-up w-full min-w-0 max-w-full"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
              {product.category || "—"}
            </p>
            <div className="inline-flex items-center gap-1.5 bg-pink-50 dark:bg-pink-950/60 border border-pink-200/80 dark:border-pink-800/60 px-3 py-1 rounded-full text-pink-600 dark:text-pink-300 text-xs font-black shadow-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating ? Number(product.rating).toFixed(1) : "5.0"} (Cute!)</span>
            </div>
          </div>
          <h1 className="mt-2 text-2xl sm:text-4xl font-black text-slate-900 dark:text-pink-100 tracking-tight leading-snug">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black text-pink-600 dark:text-pink-400 tracking-tight">
              {formatPrice(price)}
            </span>
            {onSale ? (
              <>
                <span className="text-xl text-slate-400 dark:text-slate-500 line-through font-semibold">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-cute-glow animate-pop-in">
                  🎀 -{Math.round(product.sale_percent)}% Sweet Deal
                </span>
              </>
            ) : product.original_price && product.original_price > price ? (
              <>
                <span className="text-xl text-slate-400 dark:text-slate-500 line-through font-semibold">
                  {formatPrice(product.original_price)}
                </span>
                <span className="bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs font-black px-3 py-1 rounded-full shadow-cute-glow animate-pop-in">
                  Original {formatPrice(product.original_price)}
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-5 text-slate-600 dark:text-pink-200/80 leading-relaxed text-sm sm:text-base">
            {product.description || t("product.noDescription")}
          </p>

          <p className="mt-4 text-xs sm:text-sm font-bold">
            {outOfStock ? (
              <span className="text-rose-500 font-bold">
                {t("product.outOfStock")}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-pink-300/70">
                <span className="font-extrabold text-pink-600 dark:text-pink-400">
                  ✨ {product.stock} {t("product.inStock")}
                </span>{" "}
                · 🌸 {t("product.readyToShip")}
              </span>
            )}
          </p>

          {/* Variants / Types selection */}
          {variants.length > 0 && (
            <div className="mt-6 p-4 rounded-3xl bg-pink-50/40 dark:bg-[#1A1220]/80 border border-pink-200/70 dark:border-pink-900/50 shadow-marshmallow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-pink-100 flex items-center gap-1.5">
                  <span>🎨</span>
                  <span>{t("product.selectType") || "ជម្រើសប្រភេទ / ពណ៌ (Select Option)"}:</span>
                </span>
                {selectedVariant && (
                  <span className="text-xs font-black text-pink-600 dark:text-pink-300 bg-white dark:bg-pink-950/80 px-3 py-0.5 rounded-full border border-pink-300 dark:border-pink-800 shadow-2xs">
                    🎀 {selectedVariant}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                  const isSelected = selectedVariant === variant;
                  return (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 border ${
                        isSelected
                          ? "bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white border-transparent shadow-cute-glow scale-102"
                          : "bg-white dark:bg-[#130D18] text-slate-700 dark:text-pink-200 border-pink-200/80 dark:border-pink-900/50 hover:border-pink-400 hover:bg-pink-50/50"
                      }`}
                    >
                      {variant}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row sm:flex-row items-stretch xs:items-center sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-between xs:justify-start border border-pink-200/80 dark:border-pink-900/50 bg-white dark:bg-[#1A1220] rounded-full overflow-hidden shadow-marshmallow shrink-0">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
                className="px-4 py-2.5 text-lg font-black text-pink-600 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-colors duration-200 active:scale-90 disabled:opacity-40"
                aria-label={t("product.decrease")}
              >
                −
              </button>
              <span className="px-4 py-2.5 text-base font-black min-w-12 text-center border-x border-pink-100 dark:border-pink-950/80 text-slate-800 dark:text-pink-100 tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={outOfStock}
                className="px-4 py-2.5 text-lg font-black text-pink-600 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-colors duration-200 active:scale-90 disabled:opacity-40"
                aria-label={t("product.increase")}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex-1 flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-white font-black transition-all duration-200 active:scale-95 text-sm sm:text-base ${
                added
                  ? "bg-rose-500 shadow-rose-500/30 scale-102"
                  : "bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 shadow-cute-glow hover:from-pink-500 hover:to-rose-500 hover:scale-102"
              } disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100`}
            >
              {outOfStock
                ? t("product.soldOut")
                : added
                ? "Added to Bag! 💖"
                : `🛍️ ${t("product.addToCart")} 💖`}
            </button>
          </div>

          {/* Direct Social Order / Inquire Buttons */}
          <div className="mt-4 pt-4 border-t border-pink-100 dark:border-pink-950/70 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <a
              href={getTelegramOrderUrl(s.social_telegram || s.telegram_url, product, price, selectedVariant)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-full bg-[#229ED9] hover:bg-[#1b8bc2] text-white font-black text-xs sm:text-sm shadow-md shadow-[#229ED9]/25 transition-all active:scale-95"
            >
              <TelegramIcon className="w-4 h-4" />
              <span>{t("social.orderViaTelegram") || "Order via Telegram"}</span>
            </a>

            {waOrderUrl && (
              <a
                href={waOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs sm:text-sm shadow-md shadow-[#25D366]/25 transition-all active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>{t("social.orderViaWhatsApp") || "Order via WhatsApp"}</span>
              </a>
            )}

            <a
              href={normalizeFacebook(s.social_facebook || s.facebook_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-full bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1877F2] font-black text-xs sm:text-sm border border-blue-200 dark:border-blue-900/60 transition-all active:scale-95"
            >
              <FacebookIcon className="w-4 h-4" />
              <span>{t("social.inquireFacebook") || "Chat on Facebook"}</span>
            </a>
          </div>

          {/* Product Guarantee Highlights */}
          <div className="mt-6 p-3.5 sm:p-4 rounded-3xl bg-pink-50/60 dark:bg-[#1A1220]/70 border border-pink-100/90 dark:border-pink-950/70 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs font-bold shadow-marshmallow">
            <div className="flex items-center gap-2 text-slate-700 dark:text-pink-200">
              <span className="text-base">🚚</span>
              <span>{t("trust.deliveryDesc") || "Nationwide Delivery"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-pink-200">
              <span className="text-base">🎀</span>
              <span>{t("trust.qualityTitle") || "100% Quality Guaranteed"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-pink-200">
              <span className="text-base">🇰🇭</span>
              <span>{t("trust.khqrTitle") || "Instant KHQR Payment"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-pink-200">
              <span className="text-base">💖</span>
              <span>{t("trust.supportTitle") || "Telegram & FB Support"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
