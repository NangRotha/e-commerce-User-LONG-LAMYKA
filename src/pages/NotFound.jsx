import { Link } from "react-router-dom";
import { Home, ShoppingBag, ArrowLeft, Search } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

/**
 * 404 Page Not Found — Storefront
 * Stunning luxury design, fully responsive, dark & light mode support
 */
export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="max-w-xl w-full text-center relative animate-fade-in-up">
        {/* Ambient background glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* 404 Visual Hero */}
        <div className="relative inline-block mb-6">
          <span className="text-8xl sm:text-9xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent select-none drop-shadow-sm">
            404
          </span>
          <div className="absolute -top-2 -right-4 w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-2xl animate-float">
            🛍️
          </div>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t("notFound.title") || "រកមិនឃើញទំព័រនេះទេ (Page Not Found)"}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          {t("notFound.desc") ||
            "ទំព័រដែលលោកអ្នកកំពុងស្វែងរកប្រហែលជាត្រូវបានប្តូរទីតាំង លុបចេញ ឬមិនមាននៅក្នុងប្រព័ន្ធឡើយ។"}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all duration-200 hover:shadow-lift hover:scale-[1.02] active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>{t("notFound.backHome") || "ត្រឡប់ទៅទំព័រដើម"}</span>
          </Link>

          <Link
            to="/cart"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm shadow-xs transition-all duration-200 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t("notFound.viewCart") || "មើលកន្ត្រកទំនិញ"}</span>
          </Link>
        </div>

        {/* Quick Help Link */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          <p>
            {t("notFound.needHelp") || "ត្រូវការជំនួយបន្ថែម?"}{" "}
            <Link
              to="/"
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              {t("notFound.browseProducts") || "មើលផលិតផលទាំងអស់ក្នុងហាង"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
