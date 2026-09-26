import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Star, Volume2, VolumeX } from "lucide-react";
import { useCart } from "../context/CartContext";
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
import { TelegramIcon, FacebookIcon, WhatsAppIcon, TikTokIcon } from "../components/SocialIcons";
import { getTelegramOrderUrl, getWhatsAppOrderUrl, normalizeFacebook, normalizeTikTok } from "../lib/social";

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
  const { t, lang } = useI18n();
  const s = useSiteSettings();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const waOrderUrl = getWhatsAppOrderUrl(
    s.social_whatsapp || s.whatsapp_url || s.contact_phone,
    product,
    product ? effectivePrice(product) : 0,
    selectedVariant,
    lang
  );
  const ttUrl = normalizeTikTok(s.social_tiktok);

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

  // Gallery: រៀបចំ Media ដោយធានាថាវីដេអូស្ថិតនៅមុនគេបង្អស់ (Index 0) សម្រាប់បង្ហាញភ្លាមៗពេលបើក
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

    // 1. វីដេអូចម្បង (video_url) ដាក់មុខគេបង្អស់
    if (product.video_url && product.video_url.trim()) {
      list.push({ url: product.video_url.trim(), type: "video" });
      seen.add(product.video_url.trim());
    }

    // 2. វីដេអូផ្សេងទៀតក្នុងបញ្ជី images ដាក់បន្ត
    rawImages.forEach((u) => {
      const url = (u || "").trim();
      if (url && !seen.has(url) && isVideoUrl(url)) {
        seen.add(url);
        list.push({ url, type: "video" });
      }
    });

    // 3. រូបភាពទាំងអស់ដាក់បន្ទាប់
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

  // ចាក់វីដេអូភ្លាមៗនៅពេលបើកទំព័រ ឬពេលជ្រើសរើសវីដេអូ (Instant Autoplay)
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
          // Browser policy restriction fallback: force mute & replay
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
    addItem(product, qty, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-12 w-full min-w-0 max-w-full">
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-[#120e1a]/80 border border-purple-200/80 dark:border-purple-900/50 text-slate-700 dark:text-purple-200 text-sm font-bold shadow-2xs hover:border-purple-400 hover:text-purple-600 transition-all active:scale-95"
      >
        <span>←</span>
        <span>{t("product.backToShop")}</span>
      </Link>

      <div className="mt-6 grid md:grid-cols-2 gap-8 lg:gap-14 w-full min-w-0 max-w-full">
        {/* Image gallery (Main + supporting) */}
        <div className="animate-fade-in w-full min-w-0 max-w-full overflow-hidden">
          <div className="clay-card !rounded-[28px] overflow-hidden group">
            {activeItem && activeIsVideo ? (
              ytId ? (
                <div className="w-full aspect-square bg-black">
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
                <div className="relative w-full aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                  <video
                    ref={videoRef}
                    key={activeItem}
                    autoPlay
                    muted
                    loop
                    controls
                    playsInline
                    webkit-playsinline="true"
                    preload="auto"
                    onCanPlay={(e) => {
                      e.currentTarget.muted = isMuted;
                      e.currentTarget.defaultMuted = true;
                      e.currentTarget.play().catch(() => {});
                    }}
                    onLoadedMetadata={(e) => {
                      e.currentTarget.muted = isMuted;
                      e.currentTarget.defaultMuted = true;
                      e.currentTarget.play().catch(() => {});
                    }}
                    className="relative z-10 w-full h-full object-contain"
                  >
                    <source src={activeItem} type="video/mp4" />
                    <source src={activeItem} type="video/quicktime" />
                    <source src={activeItem} type="video/webm" />
                    {t("product.videoUnsupported")}
                  </video>

                  {/* Sound Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full bg-black/65 hover:bg-black/85 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
                    title={isMuted ? t("product.unmuteSound") : t("product.muteSound")}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-purple-400" />
                        <span>{t("product.soundOff")}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>{t("product.soundOn")}</span>
                      </>
                    )}
                  </button>
                </div>
              )
            ) : activeItem ? (
              <img
                key={activeItem}
                src={activeItem}
                alt={localizedName(product, lang)}
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
                  className={`relative shrink-0 snap-start w-15 h-15 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 active:scale-95 ${
                    i === activeImage
                      ? "border-purple-500 ring-2 ring-purple-300 dark:ring-purple-800 shadow-soft scale-102"
                      : "border-purple-100 dark:border-purple-900/40 bg-white/80 dark:bg-[#120e1a] hover:border-purple-300 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`${localizedName(product, lang)} — ${i + 1}`}
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
                      <span className="absolute bottom-0.5 right-0.5 text-[9px] font-black tracking-wider uppercase px-1 py-0.5 bg-purple-600 text-white rounded">
                        {t("product.video")}
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
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 uppercase tracking-widest font-extrabold bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200/80 dark:border-purple-900/60">
              {localizedProductCategory(product, lang) || "—"}
            </p>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 px-3 py-1 rounded-full text-amber-700 dark:text-amber-300 text-xs font-black shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating ? Number(product.rating).toFixed(1) : "5.0"} ({t("product.topRated")})</span>
            </div>
          </div>
          <h1 className="mt-3 text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            {localizedName(product, lang)}
          </h1>

          <div className="mt-4 flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {formatPrice(price)}
            </span>
            {onSale ? (
              <>
                <span className="text-xl text-slate-400 dark:text-slate-500 line-through font-semibold">
                  {formatPrice(product.price)}
                </span>
                <span className="clay-nav-active text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-soft animate-pop-in">
                  🔥 -{Math.round(product.sale_percent)}% {t("product.specialDeal")}
                </span>
              </>
            ) : product.original_price && product.original_price > price ? (
              <>
                <span className="text-xl text-slate-400 dark:text-slate-500 line-through font-semibold">
                  {formatPrice(product.original_price)}
                </span>
                <span className="clay-nav-active text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-soft animate-pop-in">
                  {t("product.originalPrice")} {formatPrice(product.original_price)}
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-5 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base font-medium">
            {localizedDescription(product, lang) || t("product.noDescription")}
          </p>

          <p className="mt-4 text-xs sm:text-sm font-bold">
            {outOfStock ? (
              <span className="text-rose-500 font-bold">
                {t("product.outOfStock")}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-purple-300/70">
                <span className="font-extrabold text-purple-600 dark:text-purple-400">
                  ✨ {product.stock} {t("product.inStock")}
                </span>{" "}
                · 🚚 {t("product.readyToShip")}
              </span>
            )}
          </p>

          {/* Variants / Types selection */}
          {variants.length > 0 && (
            <div className="mt-6 p-4 sm:p-5 rounded-[24px] clay-card shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-purple-100 flex items-center gap-1.5">
                  <span>🎨</span>
                  <span>{t("product.selectType")}:</span>
                </span>
                {selectedVariant && (
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/80 px-3 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 shadow-2xs">
                    ✓ {selectedVariant}
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
                      className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 border ${
                        isSelected
                          ? "clay-nav-active text-white border-transparent shadow-soft scale-102"
                          : "bg-white/80 dark:bg-[#120e1a] text-slate-700 dark:text-purple-200 border-purple-200/80 dark:border-purple-900/50 hover:border-purple-400 hover:bg-purple-50/50"
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
            <div className="flex items-center justify-between xs:justify-start border border-purple-200/80 dark:border-purple-900/50 bg-white dark:bg-[#120e1a] rounded-2xl overflow-hidden shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
                className="px-4 py-2.5 text-lg font-black text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors duration-200 active:scale-90 disabled:opacity-40"
                aria-label={t("product.decrease")}
              >
                −
              </button>
              <span className="px-4 py-2.5 text-base font-black min-w-12 text-center border-x border-purple-100 dark:border-purple-950/80 text-slate-800 dark:text-purple-100 tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={outOfStock}
                className="px-4 py-2.5 text-lg font-black text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors duration-200 active:scale-90 disabled:opacity-40"
                aria-label={t("product.increase")}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex-1 flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-white font-extrabold transition-all duration-200 active:scale-95 text-sm sm:text-base ${
                added
                  ? "bg-emerald-500 shadow-emerald-500/30 scale-102"
                  : "clay-nav-active shadow-soft hover:scale-[1.02]"
              } disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100`}
            >
              {outOfStock
                ? t("product.soldOut")
                : added
                ? `✓ ${t("product.addedShort")}`
                : `🛍️ ${t("product.addToCart")}`}
            </button>
          </div>

          {/* Direct Social Order / Inquire Buttons */}
          <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-900/50 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <a
              href={getTelegramOrderUrl(s.social_telegram || s.telegram_url, product, price, selectedVariant, lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-2xl bg-[#229ED9] hover:bg-[#1b8bc2] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#229ED9]/25 transition-all active:scale-95"
            >
              <TelegramIcon className="w-4 h-4" />
              <span>{t("social.orderViaTelegram") || "Order via Telegram"}</span>
            </a>

            {waOrderUrl && (
              <a
                href={waOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#25D366]/25 transition-all active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>{t("social.orderViaWhatsApp") || "Order via WhatsApp"}</span>
              </a>
            )}

            <a
              href={normalizeFacebook(s.social_facebook || s.facebook_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1877F2] font-bold text-xs sm:text-sm border border-blue-200 dark:border-blue-900/60 transition-all active:scale-95"
            >
              <FacebookIcon className="w-4 h-4" />
              <span>{t("social.inquireFacebook") || "Chat on Facebook"}</span>
            </a>

            {ttUrl && (
              <a
                href={ttUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-2xl bg-black hover:bg-slate-800 text-white font-bold text-xs sm:text-sm border border-black/20 shadow-md transition-all active:scale-95 group"
              >
                <TikTokIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{t("social.watchTikTok") || "Follow on TikTok"}</span>
              </a>
            )}
          </div>

          {/* Product Guarantee Highlights */}
          <div className="mt-6 p-4 sm:p-5 rounded-[24px] clay-card grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-700 dark:text-purple-200">
              <span className="text-base">🚚</span>
              <span>{t("trust.deliveryDesc") || "Nationwide Delivery"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-purple-200">
              <span className="text-base">✨</span>
              <span>{t("trust.qualityTitle") || "100% Quality Guaranteed"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-purple-200">
              <span className="text-base">🇰🇭</span>
              <span>{t("trust.khqrTitle") || "Instant KHQR Payment"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-purple-200">
              <span className="text-base">💬</span>
              <span>{t("trust.supportTitle") || "Telegram & FB Support"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
