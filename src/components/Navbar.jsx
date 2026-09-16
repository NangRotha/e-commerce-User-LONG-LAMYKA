import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import useSiteSettings from "../hooks/useSiteSettings";
import { useI18n } from "../i18n/I18nContext";
import HeaderControls from "./HeaderControls";
import { useRealtime } from "../context/RealtimeContext";

/**
 * Navbar — Storefront
 * គ្មាន Login / Sign Up (បញ្ជាទិញជា Guest) ✓
 * មានប៊ូតុងប្តូរភាសា (ខ្មែរ/English) និងប្តូរ Theme (ភ្លឺ/ងងឹត) ✓
 */
export default function Navbar() {
  const { count } = useCart();
  const s = useSiteSettings();
  const { t } = useI18n();
  const siteName = s.site_name || "ShopNow";
  const siteLogo = s.site_logo || "";

  // ស្ថានភាព real-time (ភ្ជាប់ WebSocket ជោគជ័យ ឬអត់)
  const online = useRealtime("products_changed", () => {});

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg border-b border-slate-200/80 shadow-[0_1px_0_0_rgba(15,23,42,0.04)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-2 text-lg sm:text-xl font-extrabold text-emerald-600 shrink-0"
        >
          {siteLogo ? (
            <img
              src={siteLogo}
              alt={siteName}
              className="h-8 w-auto max-w-[140px] object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 inline-block"
            >
              🛍️
            </span>
          )}
          <span className="truncate">{siteName}</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Nav links (animation គូសបន្ទាត់ពីក្រោមពេល hover) */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `relative px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 nav-link ${
                isActive
                  ? "text-emerald-700 active"
                  : "text-slate-600 hover:text-emerald-600"
              }`
            }
          >
            {t("nav.shop")}
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 nav-link hidden sm:inline-block ${
                isActive
                  ? "text-emerald-700 active"
                  : "text-slate-600 hover:text-emerald-600"
              }`
            }
          >
            {t("nav.cart")}
          </NavLink>

          {/* Live indicator */}
          <span
            className={`hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full transition-colors duration-300 ${
              online
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-500"
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

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-all duration-200 active:scale-90"
            aria-label={`${t("nav.cart")}, ${count}`}
          >
            <span aria-hidden className="text-xl leading-none">
              🛒
            </span>
            {count > 0 && (
              <span
                key={count}
                className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center animate-pop-in shadow-sm"
              >
                {count}
              </span>
            )}
          </Link>

          {/* Language + Theme */}
          <HeaderControls />
        </div>
      </nav>
    </header>
  );
}
