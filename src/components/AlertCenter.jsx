import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";

// រយៈពេល exit animation (Popup/Banner ចេញ) មុននឹងលាក់
const EXIT_MS = 260;
// ពន្យាពេលបង្ហាញ Popup បន្តិចបន្ទាប់ពីចូលទំព័រ (ឲ្យមានអារម្មណ៍រលូន)
const ENTER_DELAY_MS = 450;

const META = {
  info: {
    icon: "ℹ️",
    banner: "bg-blue-50 border-blue-200 text-blue-800",
    bannerBtn: "hover:bg-blue-100",
    popupTitle: "text-blue-900",
    popupIcon: "bg-blue-100 text-blue-600",
    accent: "border-t-blue-500",
  },
  success: {
    icon: "✅",
    banner: "bg-emerald-50 border-emerald-200 text-emerald-800",
    bannerBtn: "hover:bg-emerald-100",
    popupTitle: "text-emerald-900",
    popupIcon: "bg-emerald-100 text-emerald-600",
    accent: "border-t-emerald-500",
  },
  warning: {
    icon: "⚠️",
    banner: "bg-amber-50 border-amber-200 text-amber-800",
    bannerBtn: "hover:bg-amber-100",
    popupTitle: "text-amber-900",
    popupIcon: "bg-amber-100 text-amber-600",
    accent: "border-t-amber-500",
  },
  danger: {
    icon: "🚨",
    banner: "bg-rose-50 border-rose-200 text-rose-800",
    bannerBtn: "hover:bg-rose-100",
    popupTitle: "text-rose-900",
    popupIcon: "bg-rose-100 text-rose-600",
    accent: "border-t-rose-500",
  },
};

/**
 * បង្ហាញ Alert / Popup ដែល Admin បង្កើតពី Admin Panel
 * - Banner: របារពណ៌នៅក្រោម Navbar
 * - Popup: ប្រអប់ Modal កណ្តាលអេក្រង់
 * - បង្ហាញម្តងទៀតរាល់ពេល Refresh page / ចូលទំព័រវិញ (មិនចងចាំការបិទទេ)
 * - មាន animation ចូល (enter) និង ចេញ (exit)
 * - Real-time: បញ្ចូលថ្មីដោយស្វ័យប្រវត្តិ ពេល Admin កែ/បង្កើត/លុប Alert
 */
export default function AlertCenter() {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState([]);
  // status[id] = 'closing' | 'hidden' — ចងចាំតែក្នុង Memory (Refresh page បាត់ -> បង្ហាញវិញ)
  const [status, setStatus] = useState({});
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(() => {
    api.getAlerts().then(setAlerts).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: Admin បង្កើត/កែ/លុប Alert -> ផ្ទុកថ្មីដោយស្វ័យប្រវត្តិ
  useRealtime("alerts_changed", load);

  // ពន្យាពេលបន្តិចមុនបង្ហាញ Popup ពេលចូលទំព័រ
  useEffect(() => {
    const t = setTimeout(() => setReady(true), ENTER_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // ពេល status = 'closing' -> បន្ទាប់ពី exit animation ចប់ ទើបលាក់ ('hidden')
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
  };

  const isVisible = (a) => status[a.id] !== "hidden";
  const isClosing = (a) => status[a.id] === "closing";

  const banners = alerts.filter(
    (a) => (a.style === "banner" || a.style === "both") && isVisible(a)
  );
  const popup = alerts.find(
    (a) => (a.style === "popup" || a.style === "both") && isVisible(a)
  );

  const handleAction = (a) => {
    if (a.link_url) {
      if (a.link_url.startsWith("/")) navigate(a.link_url);
      else window.open(a.link_url, "_blank", "noopener,noreferrer");
    }
    if (a.style === "popup") dismiss(a.id);
  };

  const handleDismiss = (e, a) => {
    e.stopPropagation();
    dismiss(a.id);
  };

  return (
    <>
      {/* Banners: របារពណ៌នៅក្រោម Navbar */}
      {banners.length > 0 && (
        <div>
          {banners.map((a) => {
            const m = META[a.alert_type] || META.info;
            return (
              <div
                key={a.id}
                role={a.link_url ? "button" : "status"}
                onClick={() => a.link_url && handleAction(a)}
                className={`relative flex items-center gap-3 px-4 sm:px-6 py-2.5 text-sm border-b overflow-hidden ${
                  isClosing(a) ? "banner-exit" : "banner-enter"
                } ${m.banner} ${a.link_url ? "cursor-pointer" : ""}`}
              >
                {a.image_url ? (
                  <img
                    src={a.image_url}
                    alt=""
                    className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover border border-black/5 bg-white"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <span aria-hidden className="text-lg">
                    {m.icon}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  {a.title && <strong className="font-bold">{a.title} </strong>}
                  <span>{a.message}</span>
                </div>
                <button
                  onClick={(e) => handleDismiss(e, a)}
                  className={`shrink-0 p-1 rounded-md opacity-60 hover:opacity-100 transition ${m.bannerBtn}`}
                  aria-label={t("alerts.dismiss")}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Popup: ប្រអប់ Modal កណ្តាលអេក្រង់ */}
      {popup && ready && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm ${
              isClosing(popup) ? "backdrop-exit" : "backdrop-enter"
            }`}
            onClick={() => dismiss(popup.id)}
          />
          <div
            key={popup.id}
            className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ${
              isClosing(popup) ? "popup-exit" : "popup-enter"
            } ${
              popup.image_url ? "" : `border-t-4 ${(META[popup.alert_type] || META.info).accent}`
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={popup.title || "Announcement"}
          >
            <button
              onClick={() => dismiss(popup.id)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 transition"
              aria-label={t("alerts.close")}
            >
              ✕
            </button>

            {/* រូបភាពធំនៅលើ (បើ Admin បញ្ចូលរូបភាព) */}
            {popup.image_url && (
              <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                <img
                  src={popup.image_url}
                  alt={popup.title || "Announcement"}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}

            <div className="p-7 sm:p-8">
              {popup.image_url ? (
                <div>
                  {popup.title && (
                    <h3
                      className={`text-2xl font-extrabold ${
                        (META[popup.alert_type] || META.info).popupTitle
                      }`}
                    >
                      {popup.title}
                    </h3>
                  )}
                  {popup.message && (
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {popup.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <span
                    className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                      (META[popup.alert_type] || META.info).popupIcon
                    }`}
                    aria-hidden
                  >
                    {(META[popup.alert_type] || META.info).icon}
                  </span>
                  <div className="min-w-0">
                    {popup.title && (
                      <h3
                        className={`text-xl font-extrabold ${
                          (META[popup.alert_type] || META.info).popupTitle
                        }`}
                      >
                        {popup.title}
                      </h3>
                    )}
                    {popup.message && (
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {popup.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-7 flex gap-3 justify-end">
                {popup.link_url && (
                  <button
                    onClick={() => handleAction(popup)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition active:scale-95"
                  >
                    {t("alerts.learnMore")}
                  </button>
                )}
                <button
                  onClick={() => dismiss(popup.id)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition active:scale-95"
                >
                  {popup.link_url ? t("alerts.later") : t("alerts.gotIt")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

