import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import useSiteSettings from "../hooks/useSiteSettings";
import { useI18n } from "../i18n/I18nContext";
import HeaderControls from "./HeaderControls";
import { useRealtime } from "../context/RealtimeContext";
import { TelegramIcon, FacebookIcon, InstagramIcon } from "./SocialIcons";
import { normalizeTelegram, normalizeFacebook, normalizeInstagram } from "../lib/social";

/**
 * Navbar — Storefront
 * ✅ Modern frosted glassmorphism & responsive layout
 * ✅ Social channels quick access (Telegram · Facebook · Instagram)
 * ✅ Real-time Live sync & Cart badge
 * ✅ Language & Theme switchers
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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0"
        >
          {siteLogo ? (
            <img
              src={siteLogo}
              alt={siteName}
              className="h-8 sm:h-9 w-auto max-w-[140px] sm:max-w-[170px] object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <ShoppingBag className="w-5 h-5" />
            </div>
          )}
          <span className="truncate tracking-tight font-black">{siteName}</span>
        </Link>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Nav links */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `relative px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            {t("nav.shop")}
          </NavLink>

          {/* Social Icons (Telegram · Facebook · Instagram) */}
          <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
            {/* Telegram */}
            <a
              href={tgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-500 hover:text-[#229ED9] hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-all duration-200 group"
              title="Telegram"
              aria-label="Telegram"
            >
              <TelegramIcon className="w-4 h-4 transition-transform group-hover:scale-115" />
            </a>

            {/* Facebook */}
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-500 hover:text-[#1877F2] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200 group"
              title="Facebook"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-4 h-4 transition-transform group-hover:scale-115" />
            </a>

            {/* Instagram */}
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-all duration-200 group"
              title="Instagram"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4 transition-transform group-hover:scale-115" />
            </a>
          </div>

          {/* Live indicator */}
          <span
            className={`hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors duration-300 ${
              online
                ? "bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
            title={t("home.liveHint")}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                online ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {t("nav.live")}
          </span>

          {/* Cart button */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-95"
            aria-label={`${t("nav.cart")}, ${count}`}
          >
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span
                key={count}
                className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[11px] font-extrabold rounded-full h-5 min-w-5 px-1 flex items-center justify-center animate-pop-in shadow-md shadow-emerald-900/20"
              >
                {count}
              </span>
            )}
          </Link>

          {/* Language + Theme toggles */}
          <HeaderControls />
        </div>
      </nav>
    </header>
  );
}

