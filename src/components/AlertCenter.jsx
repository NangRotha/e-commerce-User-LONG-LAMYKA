import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bell,
  AlertTriangle,
  Gift,
  X,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { api } from "../api/client";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";

const EXIT_MS = 260;
const ENTER_DELAY_MS = 400;

const META = {
  info: {
    icon: Bell,
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60",
    banner: "bg-blue-50/95 dark:bg-[#101b2e]/95 border-b border-blue-200/80 dark:border-blue-900/50 text-blue-950 dark:text-blue-100",
    bannerBtn: "hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300",
    popupBadge: "bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60",
    popupTitle: "text-slate-900 dark:text-white",
    glow: "from-blue-500/15 via-pink-500/10 to-transparent",
    labelKm: "ការជូនដំណឹង",
    labelEn: "Store Announcement",
  },
  success: {
    icon: Sparkles,
    badgeBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200/80 dark:border-pink-800/60",
    banner: "bg-gradient-to-r from-pink-50/95 via-rose-50/95 to-pink-50/95 dark:from-[#21111d]/95 dark:via-[#261320]/95 dark:to-[#21111d]/95 border-b border-pink-200/80 dark:border-pink-900/50 text-pink-950 dark:text-pink-100",
    bannerBtn: "hover:bg-pink-100 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300",
    popupBadge: "bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-800/60",
    popupTitle: "text-slate-900 dark:text-white",
    glow: "from-pink-500/20 via-rose-500/15 to-transparent",
    labelKm: "ប្រូម៉ូសិនពិសេស",
    labelEn: "Special Promotion",
  },
  warning: {
    icon: AlertTriangle,
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60",
    banner: "bg-amber-50/95 dark:bg-[#251a0f]/95 border-b border-amber-200/80 dark:border-amber-900/50 text-amber-950 dark:text-amber-100",
    bannerBtn: "hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300",
    popupBadge: "bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60",
    popupTitle: "text-slate-900 dark:text-white",
    glow: "from-amber-500/20 via-pink-500/10 to-transparent",
    labelKm: "ដំណឹងសំខាន់",
    labelEn: "Important Notice",
  },
  danger: {
    icon: Gift,
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60",
    banner: "bg-rose-50/95 dark:bg-[#261017]/95 border-b border-rose-200/80 dark:border-rose-900/50 text-rose-950 dark:text-rose-100",
    bannerBtn: "hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300",
    popupBadge: "bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60",
    popupTitle: "text-slate-900 dark:text-white",
    glow: "from-rose-500/25 via-pink-500/15 to-transparent",
    labelKm: "ឱកាសពិសេស",
    labelEn: "Exclusive Offer",
  },
};

/**
 * AlertCenter — Storefront Luxury Alert & Announcement Display
 * Displays live banners under the Navbar and centered popup modal dialogs
 * created by Admin from the Admin Panel.
 */
export default function AlertCenter() {
  const { t, lang } = useI18n();
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState({});
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  const getAlertTitle = useCallback(
    (a) => (lang === "km" ? a.title_km || a.title : a.title || a.title_km),
    [lang]
  );

  const getAlertMessage = useCallback(
    (a) => (lang === "km" ? a.message_km || a.message : a.message || a.message_km),
    [lang]
  );

  const load = useCallback(() => {
    api
      .getAlerts()
      .then((data) => {
        if (Array.isArray(data)) {
          setAlerts(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: Refresh alerts when Admin creates, edits, or deletes
  useRealtime("alerts_changed", () => {
    // Clear session dismissal for updated alerts so customer sees changes immediately
    try {
      sessionStorage.removeItem("dismissed_popup_session");
    } catch {}
    setStatus({});
    load();
  });

  // Smooth delay before showing popup
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), ENTER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Handle closing transition
  useEffect(() => {
    const closing = Object.entries(status)
      .filter(([, s]) => s === "closing")
      .map(([id]) => id);
    if (!closing.length) return;
    const t = setTimeout(() => {
      setStatus((prev) => {
        const next = { ...prev };
        for (const id of closing) next[id] = "hidden";
        return next;
      });
    }, EXIT_MS);
    return () => clearTimeout(t);
  }, [status]);

  const dismiss = (id) => {
    setStatus((prev) =>
      prev[id] === "closing" || prev[id] === "hidden"
        ? prev
        : { ...prev, [String(id)]: "closing" }
    );
    try {
      sessionStorage.setItem(`dismissed_alert_${id}`, "true");
    } catch {}
  };

  const isVisible = (a) => {
    if (status[a.id] === "hidden") return false;
    try {
      if (sessionStorage.getItem(`dismissed_alert_${a.id}`) === "true") {
        return false;
      }
    } catch {}
    return true;
  };

  const isClosing = (a) => status[a.id] === "closing";

  const banners = alerts.filter(
    (a) => (a.style === "banner" || a.style === "both") && isVisible(a)
  );

  const popup = alerts.find(
    (a) => (a.style === "popup" || a.style === "both") && isVisible(a)
  );

  const handleAction = (a) => {
    if (a.link_url) {
      if (a.link_url.startsWith("/")) {
        navigate(a.link_url);
      } else {
        window.open(a.link_url, "_blank", "noopener,noreferrer");
      }
    }
    dismiss(a.id);
  };

  const handleDismiss = (e, a) => {
    e.stopPropagation();
    dismiss(a.id);
  };

  return (
    <>
      {/* ==================== BANNERS (Under Navbar) ==================== */}
      {banners.length > 0 && (
        <div className="w-full flex flex-col">
          {banners.map((a) => {
            const m = META[a.alert_type] || META.info;
            const IconComp = m.icon;
            const title = getAlertTitle(a);
            const message = getAlertMessage(a);

            return (
              <div
                key={a.id}
                role={a.link_url ? "button" : "status"}
                onClick={() => a.link_url && handleAction(a)}
                className={`relative flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 text-xs sm:text-sm backdrop-blur-md transition-all ${
                  isClosing(a) ? "banner-exit" : "banner-enter"
                } ${m.banner} ${a.link_url ? "cursor-pointer group" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {a.image_url ? (
                    <img
                      src={a.image_url}
                      alt=""
                      className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-pink-200/80 shadow-2xs bg-white"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <span
                      className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-2xs ${m.badgeBg}`}
                      aria-hidden
                    >
                      <IconComp className="w-4 h-4" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    {title && (
                      <span className="font-extrabold mr-1.5 tracking-tight group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {title}
                      </span>
                    )}
                    <span className="opacity-90 font-medium">{message}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {a.link_url && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-pink-600 dark:text-pink-400 group-hover:translate-x-0.5 transition-transform">
                      <span>{t("alerts.learnMore")}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleDismiss(e, a)}
                    className={`p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-all cursor-pointer ${m.bannerBtn}`}
                    aria-label={t("alerts.dismiss")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== POPUP MODAL (Screen Center) ==================== */}
      {popup && ready && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Frosted Glass Backdrop */}
          <div
            className={`fixed inset-0 bg-slate-950/50 dark:bg-black/75 backdrop-blur-md transition-opacity ${
              isClosing(popup) ? "backdrop-exit" : "backdrop-enter"
            }`}
            onClick={() => dismiss(popup.id)}
          />

          {/* Luxury Modal Card */}
          <div
            key={popup.id}
            className={`relative w-full max-w-lg rounded-3xl sm:rounded-[36px] bg-white/95 dark:bg-[#191122]/95 backdrop-blur-2xl border border-pink-200/80 dark:border-pink-900/60 shadow-2xl overflow-hidden ${
              isClosing(popup) ? "popup-exit" : "popup-enter"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={getAlertTitle(popup) || "Announcement"}
          >
            {/* Ambient Pink Glow Overlay */}
            <div
              className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b ${
                (META[popup.alert_type] || META.info).glow
              } blur-3xl pointer-events-none`}
            />

            {/* Circular Close Button */}
            <button
              onClick={() => dismiss(popup.id)}
              className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-slate-900/40 hover:bg-slate-900/70 text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              aria-label={t("alerts.close")}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Showcase Image */}
            {popup.image_url && (
              <div className="relative h-48 sm:h-60 w-full overflow-hidden bg-pink-50/50 dark:bg-pink-950/20 group">
                <img
                  src={popup.image_url}
                  alt={getAlertTitle(popup) || "Announcement"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-[#191122] to-transparent" />
              </div>
            )}

            {/* Content Body */}
            <div className={`p-6 sm:p-8 ${popup.image_url ? "pt-2 sm:pt-3" : "pt-8"}`}>
              {/* Type Pill Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    (META[popup.alert_type] || META.info).popupBadge
                  }`}
                >
                  {(() => {
                    const Comp = (META[popup.alert_type] || META.info).icon;
                    return <Comp className="w-3.5 h-3.5" />;
                  })()}
                  <span>
                    {lang === "km"
                      ? (META[popup.alert_type] || META.info).labelKm
                      : (META[popup.alert_type] || META.info).labelEn}
                  </span>
                </span>
              </div>

              {/* Title */}
              {getAlertTitle(popup) && (
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  {getAlertTitle(popup)}
                </h3>
              )}

              {/* Message */}
              {getAlertMessage(popup) && (
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                  {getAlertMessage(popup)}
                </p>
              )}

              {/* Action Buttons Row */}
              <div className="mt-6 sm:mt-7 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => dismiss(popup.id)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer text-center"
                >
                  {popup.link_url ? t("alerts.later") : t("alerts.gotIt")}
                </button>

                {popup.link_url && (
                  <button
                    type="button"
                    onClick={() => handleAction(popup)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/35 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <span>{t("alerts.learnMore")}</span>
                    {popup.link_url.startsWith("http") ? (
                      <ExternalLink className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
