import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { effectivePrice, formatPrice, isVideoUrl } from "../lib/helpers";
import { api } from "../api/client";
import useProductsRealtime from "../hooks/useProductsRealtime";
import useSiteSettings from "../hooks/useSiteSettings";
import { useI18n } from "../i18n/I18nContext";
import { TelegramIcon, FacebookIcon } from "../components/SocialIcons";
import { getTelegramOrderUrl, normalizeFacebook } from "../lib/social";

/** Product Detail (i18n km/en + animation + real-time update) */
export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { t } = useI18n();
  const s = useSiteSettings();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState("");

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
          className="mt-4 inline-block text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
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

  const handleAdd = () => {
    addItem(product, qty, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <Link
        to="/"
        className="text-sm text-slate-500 hover:text-emerald-600 transition-colors duration-200"
      >
        {t("product.backToShop")}
      </Link>

      <div className="mt-6 grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* Image gallery (Main + supporting) */}
        <div className="animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden group">
            {activeItem && activeIsVideo ? (
              <video
                key={activeItem}
                src={activeItem}
                poster={product.image_url || undefined}
                controls
                playsInline
                preload="metadata"
                className="w-full aspect-square object-contain bg-black"
              />
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
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {media.map((item, i) => (
                <button
                  key={`${item.url}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 active:scale-95 ${
                    i === activeImage
                      ? "border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900"
                      : "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500"
                  }`}
                  aria-label={`${product.name} — ${i + 1}`}
                >
                  {item.type === "video" ? (
                    <>
                      {/* វីដេអូ: បង្ហាញរូបមេ + Icon Play + VIDEO Badge */}
                      <img
                        src={product.image_url || ""}
                        alt=""
                        className="w-full h-full object-cover opacity-70"
                      />
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
                      <span className="absolute bottom-0.5 right-0.5 text-[9px] font-black tracking-wider uppercase px-1 py-0.5 bg-emerald-600 text-white rounded">
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
          className="flex flex-col animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          <p className="text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatPrice(price)}
            </span>
            {onSale && (
              <>
                <span className="text-xl text-slate-400 dark:text-slate-500 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-gradient-to-r from-rose-600 to-rose-500 text-white text-sm font-bold px-2 py-1 rounded-full animate-pop-in">
                  -{Math.round(product.sale_percent)}%
                </span>
              </>
            )}
          </div>

          <p className="mt-6 text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description || t("product.noDescription")}
          </p>

          <p className="mt-4 text-sm">
            {outOfStock ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {t("product.outOfStock")}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {product.stock} {t("product.inStock")}
                </span>{" "}
                · {t("product.readyToShip")}
              </span>
            )}
          </p>

          {/* Variants / Types selection */}
          {variants.length > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>🎨</span>
                  <span>{t("product.selectType") || "ជម្រើសប្រភេទ / ពណ៌ (Select Option)"}:</span>
                </span>
                {selectedVariant && (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    {selectedVariant}
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
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 border ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300 dark:ring-emerald-700"
                          : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-white dark:hover:bg-slate-700"
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
            <div className="flex items-center justify-between xs:justify-start border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-soft shrink-0">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
                className="px-4 py-2.5 text-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 active:scale-90 disabled:opacity-40"
                aria-label={t("product.decrease")}
              >
                −
              </button>
              <span className="px-4 py-2.5 text-lg font-semibold min-w-12 text-center border-x border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={outOfStock}
                className="px-4 py-2.5 text-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 active:scale-90 disabled:opacity-40"
                aria-label={t("product.increase")}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex-1 flex items-center justify-center px-6 py-3.5 rounded-2xl text-white font-semibold transition-all duration-200 active:scale-95 text-sm sm:text-base ${
                added
                  ? "bg-emerald-600 shadow-lift"
                  : "bg-emerald-600 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lift"
              } disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100`}
            >
              {outOfStock
                ? t("product.soldOut")
                : added
                ? t("product.added")
                : t("product.addToCart")}
            </button>
          </div>

          {/* Direct Social Order / Inquire Buttons */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <a
              href={getTelegramOrderUrl(s.social_telegram || s.telegram_url, product, price, selectedVariant)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 rounded-2xl bg-[#229ED9] hover:bg-[#1b8bc2] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#229ED9]/25 transition-all active:scale-95"
            >
              <TelegramIcon className="w-4 h-4" />
              <span>{t("social.orderViaTelegram") || "Order via Telegram"}</span>
            </a>

            <a
              href={normalizeFacebook(s.social_facebook || s.facebook_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1877F2] font-bold text-xs sm:text-sm border border-blue-200 dark:border-blue-900/60 transition-all active:scale-95"
            >
              <FacebookIcon className="w-4 h-4" />
              <span>{t("social.inquireFacebook") || "Chat on Facebook"}</span>
            </a>
          </div>

          {/* Product Guarantee Highlights */}
          <div className="mt-6 p-3 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">🚚</span>
              <span>{t("trust.deliveryDesc") || "Nationwide Delivery"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">💎</span>
              <span>{t("trust.qualityTitle") || "100% Quality Guaranteed"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">🇰🇭</span>
              <span>{t("trust.khqrTitle") || "Instant KHQR Payment"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">💬</span>
              <span>{t("trust.supportTitle") || "Telegram & FB Support"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
