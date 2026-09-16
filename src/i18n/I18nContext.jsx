import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LANGUAGES, translations } from "./translations";

const I18nContext = createContext(null);
const LANG_KEY = "shop_lang";

/** ភាសាដំបូង៖ យកតាមការកំណត់ដែលបានរក្សាទុក -> បន្ទាប់មកតាម Browser (km/en) */
function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && translations[saved]) return saved;
  } catch {
    /* localStorage មិនអាចប្រើបាន -> ignore */
  }
  const nav =
    typeof navigator !== "undefined" ? navigator.language || "" : "";
  return nav.toLowerCase().startsWith("km") ? "km" : "en";
}

function lookup(dict, path) {
  return path
    .split(".")
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((code) => {
    if (translations[code]) setLangState(code);
  }, []);

  /** បញ្ជូនភាសាទៅវិញទៅមក (Khmer <-> English) */
  const toggleLang = useCallback(
    () => setLangState((c) => (c === "km" ? "en" : "km")),
    []
  );

  /**
   * បកប្រែ key មួយ៖ t("cart.subtotal", { count: 3 })
   * - បើ key គ្មានក្នុងភាសាបច្ចុប្បន្ន -> ប្រើអង់គ្លេស
   * - បើគ្មានទាំងពីរ -> ត្រឡប់ key វិញ (មិន crash)
   */
  const t = useCallback(
    (key, vars) => {
      let value = lookup(translations[lang], key);
      if (value === undefined) value = lookup(translations.en, key);
      if (value === undefined) return key;
      if (typeof value === "string" && vars) {
        return value.replace(/\{(\w+)\}/g, (m, k) =>
          vars[k] !== undefined ? String(vars[k]) : m
        );
      }
      return value;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, languages: LANGUAGES, isKhmer: lang === "km" }),
    [lang, setLang, toggleLang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
