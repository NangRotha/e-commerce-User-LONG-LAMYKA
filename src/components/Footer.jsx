import { Link } from "react-router-dom";
import useSiteSettings from "../hooks/useSiteSettings";
import { useI18n } from "../i18n/I18nContext";

/**
 * Footer — Storefront (មានការបង្ហាញ Logo / Site Name ពី Admin Settings)
 * បកប្រែតាមភាសាដែលបានជ្រើសរើស (ខ្មែរ / English)
 */
export default function Footer() {
  const s = useSiteSettings();
  const { t } = useI18n();
  const siteName = s.site_name || "E-Commerce Store";
  const siteLogo = s.site_logo || "";

  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link
              to="/"
              className="group flex items-center gap-2 text-lg font-extrabold text-emerald-600"
            >
              {siteLogo ? (
                <img
                  src={siteLogo}
                  alt={siteName}
                  className="h-8 w-auto max-w-[140px] object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <span aria-hidden>🛍️</span>
              )}
              <span>{siteName}</span>
            </Link>
            <p className="text-sm text-slate-400 text-center md:text-left max-w-xs">
              {t("footer.tagline")}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
              🏦 {t("footer.payWith")}
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              to="/"
              className="text-slate-500 hover:text-emerald-600 transition-colors duration-200"
            >
              {t("footer.shop")}
            </Link>
            <Link
              to="/cart"
              className="text-slate-500 hover:text-emerald-600 transition-colors duration-200"
            >
              {t("footer.cart")}
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} {siteName}. {t("footer.rights")}
          </p>
          <p className="text-xs text-slate-400">{t("pay.secureNote")}</p>
        </div>
      </div>
    </footer>
  );
}
