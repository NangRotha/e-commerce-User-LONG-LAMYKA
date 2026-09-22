import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Store,
  Menu,
  X,
  ChevronRight,
  MapPin,
  Phone,
  ExternalLink,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import useSiteSettings from "../hooks/useSiteSettings";
import { api } from "../api/client";
import { formatPrice } from "../lib/helpers";
import { useI18n } from "../i18n/I18nContext";
import { useTheme } from "../theme/ThemeContext";
import HeaderControls from "./HeaderControls";
import { useRealtime } from "../context/RealtimeContext";
import { TelegramIcon, FacebookIcon, InstagramIcon, WhatsAppIcon, TikTokIcon } from "./SocialIcons";
import { CambodiaFlag, EnglishFlag } from "./Flags";
import {
  normalizeTelegram,
  normalizeFacebook,
  normalizeInstagram,
  normalizeWhatsApp,
  normalizeTikTok,
} from "../lib/social";
import { STORE_LOCATION } from "../lib/location";

/**
 * Navbar — Storefront Luxury Redesign
 * ✅ Clean, responsive UI across all screen sizes (Mobile, Tablet, Desktop)
 * ✅ Mobile: Clean brand logo + Quick Cart pill + Modern Hamburger Menu
 * ✅ Mobile Drawer: Navigation, Language segmented toggle, Dark mode toggle, Social hub & Maps
 * ✅ Desktop: Luxury horizontal bar with Store, Social pills, Radar pulse, Cart, and Controls
 */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { count, subtotal } = useCart();
  const s = useSiteSettings();
  const { lang, setLang, t } = useI18n();
  const { isDark, toggleTheme } = useTheme();

  const siteName = s.site_name || "LONG LAMYKA";
  const siteLogo = s.site_logo || "";

  const tgUrl = normalizeTelegram(s.social_telegram || s.telegram_url);
  const waUrl = normalizeWhatsApp(s.social_whatsapp || s.whatsapp_url || (s.contact_phone ? s.contact_phone : ""));
  const fbUrl = normalizeFacebook(s.social_facebook || s.facebook_url);
  const igUrl = normalizeInstagram(s.social_instagram || s.instagram_url);
  const ttUrl = normalizeTikTok(s.social_tiktok);
  const phone = (s.contact_phone || "").trim();
  const mapsUrl = s.store_maps_url || STORE_LOCATION.mapsUrl;

  // Real-time status (WebSocket connection)
  const online = useRealtime("products_changed", () => {});

  // Top delivery milestone banner (real-time)
  const [milestones, setMilestones] = useState([]);
  const loadMilestones = useCallback(() => {
    api.getMilestones().then(setMilestones).catch(() => setMilestones([]));
  }, []);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  useRealtime("milestones_changed", loadMilestones);

  const topMilestone = (milestones || []).find(
    (m) => m.is_active !== false && m.show_on_top === true
  );
  const topThreshold = topMilestone ? topMilestone.threshold : 0;
  const topRemaining = topThreshold > 0 ? Math.max(0, topThreshold - (subtotal || 0)) : 0;
  const topPercent = topThreshold > 0 ? Math.min(100, Math.round(((subtotal || 0) / topThreshold) * 100)) : 0;

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full max-w-full bg-white/90 dark:bg-[#130D18]/90 backdrop-blur-2xl border-b border-pink-100/80 dark:border-pink-950/60 shadow-marshmallow transition-colors duration-300">
        {/* Optional Top Milestone Bar */}
        {topMilestone && (
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white text-[11px] sm:text-xs font-bold py-1 px-3 flex items-center justify-center gap-2 relative overflow-hidden">
            <Link to="/cart" className="flex items-center gap-1.5 hover:underline truncate">
              <span>{topRemaining > 0 ? (topMilestone.icon || "🎁") : (topMilestone.unlocked_icon || "🎉")}</span>
              <span>
                {topRemaining > 0
                  ? `Add ${formatPrice(topRemaining)} more for ${topMilestone.title} (${topPercent}%)`
                  : topMilestone.reward_text}
              </span>
            </Link>
            <div
              className="absolute bottom-0 left-0 h-[2px] bg-white/70 transition-all duration-300"
              style={{ width: `${topPercent}%` }}
            />
          </div>
        )}

        <nav className="max-w-7xl mx-auto px-3.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2.5 sm:gap-3 w-full max-w-full">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            className="group flex items-center gap-2 sm:gap-2.5 shrink min-w-0 focus:outline-none"
            aria-label={`${siteName} Home`}
          >
            {siteLogo ? (
              <div className="relative p-1 rounded-2xl bg-white dark:bg-[#1A1220] border border-pink-200/70 dark:border-pink-900/50 shadow-marshmallow transition-all duration-300 group-hover:scale-105 group-hover:shadow-cute-glow shrink-0 overflow-hidden">
                <img
                  src={siteLogo}
                  alt={siteName}
                  className="h-8 sm:h-10 w-auto max-w-[110px] xs:max-w-[140px] sm:max-w-[180px] object-contain rounded-xl"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-400 to-pink-500 text-white flex items-center justify-center shadow-cute-glow transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shrink-0">
                <span className="text-lg">🎀</span>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-pink-100 transition-colors group-hover:text-pink-600 dark:group-hover:text-pink-300 max-w-[130px] xs:max-w-[170px] sm:max-w-none">
                  {siteName}
                </span>
                <span className="text-xs animate-cute-bounce">✨</span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-pink-500 dark:text-pink-400">
                <span>🎀</span> Cute & Lovely Store
              </span>
            </div>
          </Link>

          {/* =========================================================
              DESKTOP CONTROLS (md: and above)
              Full horizontal layout with Store, Social, Cart, and Theme
             ========================================================= */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
            {/* Store Navigation Link */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white shadow-cute-glow scale-102"
                    : "text-slate-600 dark:text-pink-200/80 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-pink-50/80 dark:hover:bg-pink-950/40"
                }`
              }
            >
              <span>🌸</span>
              <span>{t("nav.shop")}</span>
            </NavLink>

            {/* Divider */}
            <div className="h-6 w-px bg-pink-200/60 dark:bg-pink-900/40 my-auto" />

            {/* Social Channels (Telegram · Facebook · Instagram) */}
            <div className="flex items-center gap-1.5">
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-2xl border border-pink-100 dark:border-pink-950/70 bg-pink-50/40 dark:bg-[#1A1220]/80 flex items-center justify-center text-slate-500 hover:text-[#229ED9] hover:border-[#229ED9]/40 hover:bg-[#229ED9]/10 shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group"
                title="Telegram"
                aria-label="Telegram"
              >
                <TelegramIcon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
              </a>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-2xl border border-pink-100 dark:border-pink-950/70 bg-pink-50/40 dark:bg-[#1A1220]/80 flex items-center justify-center text-slate-500 hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/10 shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                </a>
              )}

              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-2xl border border-pink-100 dark:border-pink-950/70 bg-pink-50/40 dark:bg-[#1A1220]/80 flex items-center justify-center text-slate-500 hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10 shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group"
                title="Facebook"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
              </a>

              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-2xl border border-pink-100 dark:border-pink-950/70 bg-pink-50/40 dark:bg-[#1A1220]/80 flex items-center justify-center text-slate-500 hover:text-pink-500 hover:border-pink-500/40 hover:bg-pink-500/10 shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group"
                title="Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
              </a>

              {ttUrl && (
                <a
                  href={ttUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-2xl border border-pink-100 dark:border-pink-950/70 bg-pink-50/40 dark:bg-[#1A1220]/80 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 hover:bg-black/5 dark:hover:bg-white/10 shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group"
                  title="TikTok"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                </a>
              )}
            </div>

            {/* Live Indicator */}
            <div
              className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-colors ${
                online
                  ? "bg-pink-50/80 dark:bg-pink-950/50 border-pink-200/80 dark:border-pink-800/60 text-pink-600 dark:text-pink-300"
                  : "bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
              title={t("home.liveHint")}
            >
              <span className="relative flex h-2 w-2">
                {online && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    online ? "bg-pink-500" : "bg-slate-400"
                  }`}
                />
              </span>
              <span className="tracking-wider uppercase text-[10px]">🌸 {t("nav.live")}</span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-pink-200/60 dark:bg-pink-900/40 my-auto" />

            {/* Cart Button with cute pink bubble */}
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-pink-950/60 dark:text-pink-100 font-black text-xs shadow-marshmallow hover:shadow-cute-glow hover:scale-105 active:scale-95 transition-all duration-200 group shrink-0 border border-slate-800 dark:border-pink-800/50"
              aria-label={`${t("nav.cart")}, ${count}`}
            >
              <span className="text-sm transition-transform group-hover:rotate-12">🛍️</span>
              <span className="font-extrabold">{t("nav.cart")}</span>
              <span
                key={count}
                className="bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white text-[11px] font-black rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shadow-xs shadow-pink-500/40 animate-cute-bounce"
              >
                {count}
              </span>
            </Link>

            {/* Language & Theme toggles */}
            <HeaderControls />
          </div>

          {/* =========================================================
              MOBILE CONTROLS (< md:)
              Language button + Quick Cart Button + Modern Hamburger Menu
             ========================================================= */}
          <div className="flex md:hidden items-center gap-1.5 xs:gap-2 shrink-0">
            {/* Mobile Language Button (direct toggle in navbar) */}
            <button
              type="button"
              onClick={() => setLang(lang === "km" ? "en" : "km")}
              aria-label={lang === "km" ? "Switch language to English" : "ប្តូរភាសាទៅខ្មែរ"}
              title={lang === "km" ? "Switch to English" : "ប្តូរទៅភាសាខ្មែរ"}
              className="inline-flex items-center gap-1 xs:gap-1.5 h-10 px-2.5 rounded-2xl bg-pink-50/70 dark:bg-[#1A1220] text-slate-800 dark:text-pink-200 border border-pink-200/80 dark:border-pink-900/50 font-bold text-xs shadow-marshmallow active:scale-95 transition-all select-none hover:bg-pink-100/60"
            >
              {lang === "km" ? (
                <>
                  <CambodiaFlag className="w-4 h-3 rounded-[3px] shadow-2xs shrink-0" />
                  <span className="font-bold text-xs tracking-tight">ខ្មែរ</span>
                </>
              ) : (
                <>
                  <EnglishFlag className="w-4 h-3 rounded-[3px] shadow-2xs shrink-0" />
                  <span className="font-bold text-xs tracking-tight">EN</span>
                </>
              )}
            </button>

            {/* Mobile Quick Cart Button */}
            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-400 to-pink-500 text-white font-bold shadow-cute-glow active:scale-95 transition-all"
              aria-label={`${t("nav.cart")}, ${count}`}
            >
              <span className="text-base">🛍️</span>
              <span
                key={count}
                className="absolute -top-1 -right-1 bg-white text-pink-600 dark:bg-slate-900 dark:text-pink-400 text-[10px] font-black rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center shadow-xs ring-2 ring-pink-400 dark:ring-pink-600 animate-cute-bounce"
              >
                {count}
              </span>
            </Link>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? t("common.close") : t("nav.menu") || "Menu"}
              aria-expanded={mobileOpen}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-200 active:scale-95 ${
                mobileOpen
                  ? "bg-pink-500 text-white border-transparent shadow-cute-glow"
                  : "bg-pink-50/70 dark:bg-[#1A1220] text-slate-700 dark:text-pink-200 border-pink-200/80 dark:border-pink-900/50 hover:bg-pink-100/60"
              }`}
            >
              {mobileOpen ? (
                <X className="w-5 h-5 animate-scale-in" />
              ) : (
                <Menu className="w-5 h-5 animate-scale-in" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* =========================================================
          MOBILE NAVIGATION DRAWER (Slide from right with frosted glass)
         ========================================================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <aside
            className="relative z-10 w-full max-w-[320px] xs:max-w-[340px] h-full bg-[#FFF5F8]/95 dark:bg-[#130D18]/95 backdrop-blur-2xl border-l border-pink-200/80 dark:border-pink-900/50 shadow-2xl flex flex-col justify-between p-5 overflow-y-auto animate-slide-left select-none"
            role="dialog"
            aria-label="Mobile Navigation Menu"
          >
            {/* Drawer Top / Header */}
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-pink-100 dark:border-pink-950/80">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 min-w-0"
                >
                  {siteLogo ? (
                    <img
                      src={siteLogo}
                      alt={siteName}
                      className="h-8 w-auto max-w-[110px] object-contain rounded-xl"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-400 to-pink-500 text-white flex items-center justify-center shadow-cute-glow">
                      <span>🎀</span>
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-black text-sm text-slate-900 dark:text-pink-100 truncate">
                      {siteName}
                    </span>
                    <span className="text-[10px] font-extrabold text-pink-500 dark:text-pink-400 uppercase tracking-wider">
                      🎀 Official Store
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 rounded-2xl bg-pink-100/60 hover:bg-pink-200/60 dark:bg-pink-950/60 dark:hover:bg-pink-900/60 text-slate-600 dark:text-pink-300 flex items-center justify-center transition-colors active:scale-95"
                  aria-label={t("common.close")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Cards */}
              <div className="space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-pink-400 dark:text-pink-500 px-1">
                  🌸 {t("nav.navigation") || "Navigation"}
                </p>

                {/* Store Link */}
                <NavLink
                  to="/"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between p-3.5 rounded-2xl font-black transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white shadow-cute-glow"
                        : "bg-white dark:bg-[#1A1220]/80 text-slate-800 dark:text-pink-100 hover:bg-pink-50 dark:hover:bg-pink-950/30 border border-pink-100 dark:border-pink-950/80 shadow-marshmallow"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-pink-100/60 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 flex items-center justify-center shrink-0">
                      <span>🌸</span>
                    </div>
                    <div className="text-left">
                      <span className="text-sm block">{t("nav.shop")}</span>
                      <span className="text-[10px] opacity-75 font-normal block">
                        Browse all cute items
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </NavLink>

                {/* Cart Link */}
                <NavLink
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between p-3.5 rounded-2xl font-black transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white shadow-cute-glow"
                        : "bg-white dark:bg-[#1A1220]/80 text-slate-800 dark:text-pink-100 hover:bg-pink-50 dark:hover:bg-pink-950/30 border border-pink-100 dark:border-pink-950/80 shadow-marshmallow"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-rose-100/60 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                      <span>🛍️</span>
                    </div>
                    <div className="text-left">
                      <span className="text-sm block">{t("nav.cart")}</span>
                      <span className="text-[10px] opacity-75 font-normal block">
                        Instant KHQR checkout
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs animate-cute-bounce">
                      {count}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </div>
                </NavLink>
              </div>

              {/* Language & Appearance Control Hub */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                {/* Language Segmented Toggle */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <span>🌐</span>
                    <span>{t("nav.language") || "Language"}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => setLang("km")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        lang === "km"
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <CambodiaFlag className="w-4 h-3 rounded-[2px] shrink-0" />
                      <span>ខ្មែរ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang("en")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        lang === "en"
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <EnglishFlag className="w-4 h-3 rounded-[2px] shrink-0" />
                      <span>English</span>
                    </button>
                  </div>
                </div>

                {/* Appearance / Theme Segmented Toggle */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <span>🎨</span>
                    <span>{t("nav.appearance") || "Appearance"}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => {
                        if (isDark) toggleTheme();
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        !isDark
                          ? "bg-white text-rose-600 shadow-xs border border-pink-200/60"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t("nav.lightMode")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isDark) toggleTheme();
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        isDark
                          ? "bg-slate-800 text-pink-400 shadow-xs border border-pink-900/50"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-pink-400" />
                      <span>{t("nav.darkMode")}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Channels & Support */}
              <div className="space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                  {t("nav.channels") || "Channels & Support"}
                </p>

                <div className="grid grid-cols-1 gap-1.5">
                  {/* Telegram */}
                  <a
                    href={tgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 text-[#229ED9] hover:bg-[#229ED9] hover:text-white transition-all duration-200 group text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#229ED9] text-white flex items-center justify-center shadow-2xs">
                        <TelegramIcon className="w-4 h-4" />
                      </div>
                      <span>Telegram Official Chat</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </a>

                  {/* WhatsApp */}
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#25D366]/10 dark:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-200 group text-xs font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-2xs">
                          <WhatsAppIcon className="w-4 h-4" />
                        </div>
                        <span>WhatsApp Chat</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  )}

                  {/* Facebook */}
                  <a
                    href={fbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-200 group text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shadow-2xs">
                        <FacebookIcon className="w-4 h-4" />
                      </div>
                      <span>Facebook Page</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </a>

                  {/* Instagram */}
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/40 text-pink-600 hover:bg-pink-600 hover:text-white transition-all duration-200 group text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-2xs">
                        <InstagramIcon className="w-4 h-4" />
                      </div>
                      <span>Instagram</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </a>

                  {/* TikTok */}
                  {ttUrl && (
                    <a
                      href={ttUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 group text-xs font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shadow-2xs">
                          <TikTokIcon className="w-4 h-4" />
                        </div>
                        <span>TikTok</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  )}

                  {/* Store Location */}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all duration-200 group text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-2xs">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span>Google Maps Store</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </a>

                  {/* Direct Phone Call */}
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/40 text-pink-700 dark:text-pink-300 hover:bg-rose-500 hover:text-white transition-all duration-200 group text-xs font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-pink-500 text-white flex items-center justify-center shadow-2xs">
                          <Phone className="w-4 h-4" />
                        </div>
                        <span>Call: {phone}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Bottom / Footer */}
            <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/80 mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
                  </span>
                  <span className="font-semibold text-pink-600 dark:text-pink-400">
                    {t("nav.onlineMsg") || "System Online · KHQR Ready"}
                  </span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-600">
                © {new Date().getFullYear()} {siteName}. All rights reserved.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
