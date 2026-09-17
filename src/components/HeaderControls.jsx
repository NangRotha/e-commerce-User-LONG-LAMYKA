import { useI18n } from "../i18n/I18nContext";
import { useTheme } from "../theme/ThemeContext";

/** Icon ព្រះអាទិត្យ / ព្រះចន្ទ (សម្រាប់ Theme Toggle) */
function SunIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * ប៊ូតុងប្តូរភាសា (ខ្មែរ / English) និងប្តូរ Theme (ភ្លឺ / ងងឹត)
 * មាន animation រលូន — ប្រើនៅលើ Navbar (Storefront) និង Topbar (Admin)
 */
export default function HeaderControls({ className = "" }) {
  const { lang, setLang, languages, t } = useI18n();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* ===== Language Selector ===== */}
      <div
        role="group"
        aria-label={t("nav.selectLanguage")}
        title={t("nav.language")}
        className="relative flex items-center rounded-full bg-slate-100 dark:bg-slate-800/90 p-0.5 border border-slate-200/80 dark:border-slate-700/80 shadow-inner"
      >
        <span
          className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-sm transition-transform duration-300 ease-out"
          style={{
            transform:
              languages[0].code === lang ? "translateX(2px)" : "translateX(calc(100% + 2px))",
          }}
        />
        {languages.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={lang === l.code}
            className={`relative z-10 px-2.5 py-1 text-xs font-bold rounded-full transition-colors duration-300 ${
              lang === l.code
                ? "text-white drop-shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="hidden sm:inline">{l.label}</span>
            <span className="sm:hidden">{l.short}</span>
          </button>
        ))}
      </div>

      {/* ===== Theme Toggle (Dark / Light) ===== */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? t("nav.lightMode") : t("nav.darkMode")}
        title={isDark ? t("nav.lightMode") : t("nav.darkMode")}
        className="group relative w-9 h-9 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all duration-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-400 dark:hover:text-emerald-400 hover:shadow-md hover:shadow-emerald-500/10 active:scale-90 overflow-hidden"
      >
        <span
          className={`absolute transition-all duration-500 ${
            isDark
              ? "translate-y-0 rotate-0 opacity-100 text-amber-400"
              : "-translate-y-8 rotate-90 opacity-0"
          }`}
        >
          <SunIcon className="w-4.5 h-4.5" />
        </span>
        <span
          className={`absolute transition-all duration-500 ${
            isDark
              ? "translate-y-8 -rotate-90 opacity-0"
              : "translate-y-0 rotate-0 opacity-100 text-slate-700"
          }`}
        >
          <MoonIcon className="w-4 h-4" />
        </span>
      </button>
    </div>
  );
}
