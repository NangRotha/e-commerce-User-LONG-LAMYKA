import { useState, useEffect, useCallback, useMemo } from "react";
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
 * Navbar — Storefront 3D Claymorphic Redesign (Matched with Frontend-Admin)
 * Styled with soft lilac borders, 3D avatar, time-of-day greeting, and clay controls.
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

  // Time-of-day greeting matching admin dashboard
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: t("layout.goodMorning", { name: siteName }), icon: "☁️" };
    if (hour < 18) return { text: t("layout.goodAfternoon", { name: siteName }), icon: "☀️" };
    return { text: t("layout.goodEvening", { name: siteName }), icon: "🌙" };
  }, [siteName, t]);

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
      <header className="sticky top-0 z-40 w-full max-w-full bg-white/85 dark:bg-[#160f1c]/85 backdrop-blur-2xl border-b border-purple-100/70 dark:border-purple-950/50 shadow-soft transition-colors duration-300">
        {/* Optional Top Milestone Bar */}
        {topMilestone && (
          <div className="bg-[#FF9CCE] text-white text-[11px] sm:text-xs font-black py-1.5 px-3 flex items-center justify-center gap-2 relative overflow-hidden transition-colors shadow-2xs [text-shadow:_0_1px_2px_rgba(140,20,80,0.35)]">
            <Link to="/cart" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity truncate">
              <span>{topRemaining > 0 ? (topMilestone.icon || "🎁") : (topMilestone.unlocked_icon || "🎉")}</span>
              <span className="font-extrabold tracking-wide">
                {topRemaining > 0
                  ? t("milestone.addMore", {
                      amount: formatPrice(topRemaining),
                      title:
                        lang === "km"
                          ? topMilestone.title_km || topMilestone.title
                          : topMilestone.title || topMilestone.title_km,
                      percent: topPercent,
                    })
                  : lang === "km"
                  ? topMilestone.reward_text_km || topMilestone.reward_text
                  : topMilestone.reward_text || topMilestone.reward_text_km}
              </span>
            </Link>
            <div
              className="absolute bottom-0 left-0 h-[2.5px] bg-white/80 transition-all duration-300 rounded-full"
              style={{ width: `${topPercent}%` }}
            />
          </div>
        )}

        <nav className="max-w-7xl mx-auto px-3.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2.5 sm:gap-3 w-full max-w-full">
          {/* Brand Section with 3D Avatar & Greeting (Matched with Admin layout) */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 sm:gap-3.5 shrink min-w-0 focus:outline-none"
            aria-label={`${siteName} Home`}
          >
            {/* 3D Avatar character in circle with white border (Same as Admin) */}
            <div className="relative group shrink-0">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shadow-md shadow-purple-300/40 dark:shadow-none bg-[#f6f0fc]"
                style={{ border: "2.5px solid white" }}
              >
                <img
                  src={siteLogo || "/avatar_clay.jpg"}
                  alt={siteName}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "/avatar_clay.jpg";
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-base sm:text-lg font-black tracking-tight text-slate-800 dark:text-white transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-300 max-w-[130px] xs:max-w-[170px] sm:max-w-none">
                  {siteName}
                </span>
                <span className="text-xs">✨</span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-purple-200/70 truncate">
                <span>{greeting.text}</span>
                <span>{greeting.icon}</span>
              </span>
            </div>
          </Link>

          {/* =========================================================
              DESKTOP CONTROLS (md: and above)
              Full horizontal layout matching Frontend-Admin
             ========================================================= */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
            {/* Store Navigation Link with Clay Pill */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "clay-nav-active"
                    : "text-slate-600 dark:text-purple-200/70 hover:text-purple-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5"
                }`
              }
            >
              <span>🌸</span>
              <span>{t("nav.shop")}</span>
            </NavLink>

            {/* Divider */}
            <div className="h-6 w-px bg-purple-200/60 dark:bg-purple-900/40 my-auto" />

            {/* Social Channels (Styled as Clay Buttons) */}
            <div className="flex items-center gap-1.5">
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 clay-circle-btn flex items-center justify-center text-slate-500 hover:text-[#229ED9] group"
                title={t("social.telegram")}
                aria-label={t("social.telegram")}
              >
                <TelegramIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              </a>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 clay-circle-btn flex items-center justify-center text-slate-500 hover:text-[#25D366] group"
                  title={t("social.whatsapp")}
                  aria-label={t("social.whatsapp")}
                >
                  <WhatsAppIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                </a>
              )}

              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 clay-circle-btn flex items-center justify-center text-slate-500 hover:text-[#1877F2] group"
                title={t("social.facebook")}
                aria-label={t("social.facebook")}
              >
                <FacebookIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              </a>

              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 clay-circle-btn flex items-center justify-center text-slate-500 hover:text-pink-500 group"
                title={t("social.instagram")}
                aria-label={t("social.instagram")}
              >
                <InstagramIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              </a>

              {ttUrl && (
                <a
                  href={ttUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 clay-circle-btn flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white group"
                  title={t("social.tiktok")}
                  aria-label={t("social.tiktok")}
                >
                  <TikTokIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                </a>
              )}
            </div>

            {/* Live Indicator Pill */}
            <div
              className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-colors ${
                online
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-300"
                  : "bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
              title={t("home.liveHint")}
            >
              <span className="relative flex h-2 w-2">
                {online && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    online ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
              </span>
              <span className="tracking-wider uppercase text-[10px]">🌸 {t("nav.live")}</span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-purple-200/60 dark:bg-purple-900/40 my-auto" />

            {/* Cart Button Styled as Clay Card Pill */}
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-[#1c1626] text-slate-800 dark:text-purple-100 font-bold text-xs shadow-soft hover:shadow-lift hover:scale-105 active:scale-95 transition-all duration-200 group shrink-0 border border-purple-200/80 dark:border-purple-900/40"
              aria-label={`${t("nav.cart")}, ${count}`}
            >
              <span className="text-sm transition-transform group-hover:rotate-12">🛍️</span>
              <span className="font-bold">{t("nav.cart")}</span>
              <span
                key={count}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white text-[11px] font-black rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shadow-xs shadow-purple-500/30 animate-cute-bounce"
              >
                {count}
              </span>
              {subtotal > 0 && (
                <span className="text-purple-600 dark:text-purple-300 text-xs font-black hidden lg:inline">
                  {formatPrice(subtotal)}
                </span>
              )}
            </Link>

            {/* Language & Theme toggles matching admin */}
            <HeaderControls />
          </div>

          {/* =========================================================
              MOBILE CONTROLS (< md:)
             ========================================================= */}
          <div className="flex md:hidden items-center gap-1.5 xs:gap-2 shrink-0">
            {/* Mobile Language Button (direct toggle with flag) */}
            <button
              type="button"
              onClick={() => setLang(lang === "km" ? "en" : "km")}
              aria-label={
                lang === "km" ? t("nav.switchToEnglish") : t("nav.switchToKhmer")
              }
              title={lang === "km" ? t("nav.switchToEnglish") : t("nav.switchToKhmer")}
              className="clay-circle-btn inline-flex items-center gap-1 xs:gap-1.5 h-10 px-2.5 rounded-2xl text-slate-800 dark:text-purple-200 font-bold text-xs select-none"
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
              className="clay-circle-btn relative inline-flex items-center justify-center w-10 h-10 rounded-2xl text-slate-800 dark:text-purple-100 font-bold"
              aria-label={`${t("nav.cart")}, ${count}`}
            >
              <span className="text-base">🛍️</span>
              <span
                key={count}
                className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-[#160f1c] animate-cute-bounce"
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
              className={`clay-circle-btn w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                mobileOpen
                  ? "bg-purple-500 text-white"
                  : "text-slate-700 dark:text-purple-200"
              }`}
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-current" />
              ) : (
                <Menu className="w-5 h-5 text-current" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* =========================================================
          MOBILE NAVIGATION DRAWER (Slide from right with 3D clay aesthetic)
         ========================================================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container styled like admin sidebar */}
          <aside
            className="relative z-10 w-full max-w-[320px] xs:max-w-[340px] h-full admin-mesh-bg border-l border-purple-200/80 dark:border-purple-900/50 shadow-2xl flex flex-col justify-between p-4 overflow-y-auto animate-slide-left select-none font-sans"
            role="dialog"
            aria-label={t("nav.mobileNav")}
          >
            <div className="space-y-4">
              {/* Drawer Top / Profile Box (Same as Frontend-Admin Sidebar) */}
              <div className="clay-card-purple p-4 flex flex-col items-center text-center relative border border-white/80 dark:border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="clay-circle-btn absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-purple-300"
                  aria-label={t("common.close")}
                >
                  <X className="w-4 h-4" />
                </button>

                <div
                  className="w-16 h-16 rounded-full overflow-hidden shadow-md shadow-purple-300/40 dark:shadow-none bg-[#f6f0fc] mb-2"
                  style={{ border: "3px solid white" }}
                >
                  <img
                    src={siteLogo || "/avatar_clay.jpg"}
                    alt={siteName}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.target.src = "/avatar_clay.jpg";
                    }}
                  />
                </div>

                <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
                  <span>{t("layout.hi", { name: siteName })}</span>
                  <span className="inline-block animate-bounce" style={{ animationDuration: "2s" }}>👋</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-purple-200/70 font-medium mt-0.5">
                  {t("layout.goodToSeeYou")}
                </p>
              </div>

              {/* Navigation Cards */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 dark:text-purple-400 px-1">
                  🌸 {t("nav.navigation") || "Navigation"}
                </p>

                {/* Store Link */}
                <NavLink
                  to="/"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between p-3 rounded-2xl font-bold transition-all duration-200 ${
                      isActive
                        ? "clay-nav-active"
                        : "clay-card text-slate-800 dark:text-purple-100 hover:bg-white/80"
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                      <span>🌸</span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black block">{t("nav.shop")}</span>
                      <span className="text-[10px] opacity-75 font-normal block">
                        {t("home.browseAll")}
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
                    `flex items-center justify-between p-3 rounded-2xl font-bold transition-all duration-200 ${
                      isActive
                        ? "clay-nav-active"
                        : "clay-card text-slate-800 dark:text-purple-100 hover:bg-white/80"
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                      <span>🛍️</span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black block">{t("nav.cart")}</span>
                      <span className="text-[10px] opacity-75 font-normal block">
                        {t("home.instantKhqrCheckout")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      {count}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </div>
                </NavLink>
              </div>

              {/* Language & Appearance Control Hub */}
              <div className="clay-card p-3 space-y-3">
                {/* Language Segmented Toggle */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-purple-300/80 mb-1.5 flex items-center gap-1">
                    <span>🌐</span>
                    <span>{t("nav.language") || "Language"}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30">
                    <button
                      type="button"
                      onClick={() => setLang("km")}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        lang === "km"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <CambodiaFlag className="w-4 h-3 rounded-[2px] shrink-0" />
                      <span>ខ្មែរ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang("en")}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        lang === "en"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <EnglishFlag className="w-4 h-3 rounded-[2px] shrink-0" />
                      <span>English</span>
                    </button>
                  </div>
                </div>

                {/* Appearance / Theme Segmented Toggle */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-purple-300/80 mb-1.5 flex items-center gap-1">
                    <span>🎨</span>
                    <span>{t("nav.appearance") || "Appearance"}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30">
                    <button
                      type="button"
                      onClick={() => {
                        if (isDark) toggleTheme();
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        !isDark
                          ? "bg-white text-purple-700 shadow-xs border border-purple-200/60"
                          : "text-slate-600 dark:text-slate-300"
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
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        isDark
                          ? "bg-[#1c1626] text-purple-300 shadow-xs border border-purple-800/40"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-purple-400" />
                      <span>{t("nav.darkMode")}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Channels & Support */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-purple-400 px-1">
                  {t("nav.channels") || "Channels & Support"}
                </p>

                <div className="grid grid-cols-1 gap-1">
                  <a
                    href={tgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 text-[#229ED9] hover:bg-[#229ED9] hover:text-white transition-all duration-200 group text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#229ED9] text-white flex items-center justify-center shadow-2xs">
                        <TelegramIcon className="w-3.5 h-3.5" />
                      </div>
                      <span>{t("social.tgOfficialChat")}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </a>

                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-xl bg-[#25D366]/10 dark:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-200 group text-xs font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-2xs">
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                        </div>
                        <span>{t("social.waChat")}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  )}

                  <a
                    href={fbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-200 group text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shadow-2xs">
                        <FacebookIcon className="w-3.5 h-3.5" />
                      </div>
                      <span>{t("social.fbOfficialPage")}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Store Card matching Admin's plant_clay bottom card */}
            <div className="pt-3 border-t border-purple-200/50 dark:border-purple-900/40">
              <div className="clay-card p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white dark:border-purple-900/30">
                  <img src="/plant_clay.jpg" alt="Store mascot" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black text-slate-800 dark:text-white truncate">
                    {siteName} 🌸
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-purple-200/60 font-medium truncate">
                    {t("nav.onlineMsg")}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
