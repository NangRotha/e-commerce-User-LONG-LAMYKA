import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Store, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import useSiteSettings from "../hooks/useSiteSettings";
import { useI18n } from "../i18n/I18nContext";
import HeaderControls from "./HeaderControls";
import { useRealtime } from "../context/RealtimeContext";
import { TelegramIcon, FacebookIcon, InstagramIcon } from "./SocialIcons";
import { normalizeTelegram, normalizeFacebook, normalizeInstagram } from "../lib/social";

/**
 * Navbar — Storefront Luxury Redesign
 * ✅ Polished frosted glassmorphism & responsive layout
 * ✅ Framed logo with high-contrast luxury typography
 * ✅ Branded social channel pills (Telegram · Facebook · Instagram)
 * ✅ Interactive Live Radar pulse
 * ✅ Prominent luxury Cart action pill
 * ✅ Complete dark mode language & theme controls
 */
export default function Navbar() {
  const { count } = useCart();
  const s = useSiteSettings();
  const { t } = useI18n();
  const siteName = s.site_name || "ShopNow";
  const siteLogo = s.site_logo || "";

  const tgUrl = normalizeTelegram(s.social_telegram || s.telegram_url);
  const fbUrl = normalizeFacebook(s.social_facebook || s.facebook_url);
  const igUrl = normalizeInstagram(s.social_instagram || s.instagram_url);

  // ស្ថានភាព real-time (ភ្ជាប់ WebSocket ជោគជ័យ ឬអត់)
  const online = useRealtime("products_changed", () => {});

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/80 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-2 sm:gap-3 shrink-0 focus:outline-none min-w-0"
        >
          {siteLogo ? (
            <div className="relative p-1 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0 overflow-hidden">
              <img
                src={siteLogo}
                alt={siteName}
                className="h-7 sm:h-10 w-auto max-w-[100px] xs:max-w-[130px] sm:max-w-[170px] object-contain rounded-lg sm:rounded-xl"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm sm:text-lg font-black tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400 max-w-[95px] xs:max-w-[140px] sm:max-w-none">
              {siteName}
            </span>
            <span className="hidden sm:inline-flex text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Official Store
            </span>
          </div>
        </Link>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Shop Navigation Tab */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
              }`
            }
          >
            <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t("nav.shop")}</span>
          </NavLink>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-slate-200/80 dark:bg-slate-800/90 my-auto" />

          {/* Social Channels (Telegram · Facebook · Instagram) */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Telegram */}
            <a
              href={tgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center text-slate-500 hover:text-[#229ED9] hover:border-[#229ED9]/40 hover:bg-[#229ED9]/10 shadow-xs transition-all duration-200 active:scale-95 group"
              title="Telegram"
              aria-label="Telegram"
            >
              <TelegramIcon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
            </a>

            {/* Facebook */}
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center text-slate-500 hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10 shadow-xs transition-all duration-200 active:scale-95 group"
              title="Facebook"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
            </a>

            {/* Instagram */}
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center text-slate-500 hover:text-pink-500 hover:border-pink-500/40 hover:bg-pink-500/10 shadow-xs transition-all duration-200 active:scale-95 group"
              title="Instagram"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
            </a>
          </div>

          {/* Live Status indicator */}
          <div
            className={`hidden lg:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              online
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"
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
            <span className="tracking-wider uppercase text-[10px]">{t("nav.live")}</span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-slate-200/80 dark:bg-slate-800/90 my-auto" />

          {/* Cart Action Button */}
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 group shrink-0"
            aria-label={`${t("nav.cart")}, ${count}`}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-rotate-6" />
            <span className="hidden sm:inline font-bold">{t("nav.cart")}</span>
            <span
              key={count}
              className="bg-emerald-500 text-white text-[10px] sm:text-[11px] font-black rounded-full h-4.5 min-w-4.5 sm:h-5 sm:min-w-5 px-1 sm:px-1.5 flex items-center justify-center shadow-xs animate-pop-in"
            >
              {count}
            </span>
          </Link>

          {/* Language & Theme toggles */}
          <HeaderControls />
        </div>
      </nav>
    </header>
  );
}
