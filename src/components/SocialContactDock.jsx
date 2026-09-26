import { useState } from "react";
import { X, Phone, ExternalLink, MapPin } from "lucide-react";
import useSiteSettings from "../hooks/useSiteSettings";
import { TelegramIcon, FacebookIcon, InstagramIcon, WhatsAppIcon, TikTokIcon } from "./SocialIcons";
import { normalizeTelegram, normalizeFacebook, normalizeInstagram, normalizeWhatsApp, normalizeTikTok } from "../lib/social";
import { useI18n } from "../i18n/I18nContext";
import { STORE_LOCATION } from "../lib/location";

export default function SocialContactDock() {
  const s = useSiteSettings();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const tgUrl = normalizeTelegram(s.social_telegram || s.telegram_url);
  const waUrl = normalizeWhatsApp(s.social_whatsapp || s.whatsapp_url || s.contact_phone);
  const fbUrl = normalizeFacebook(s.social_facebook || s.facebook_url);
  const igUrl = normalizeInstagram(s.social_instagram || s.instagram_url);
  const ttUrl = normalizeTikTok(s.social_tiktok);
  const phone = (s.contact_phone || "").trim();
  const mapsUrl = s.store_maps_url || STORE_LOCATION.mapsUrl;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:left-6 z-40 flex flex-col items-end sm:items-start gap-3 pointer-events-auto">
      {/* Expanded popout menu */}
      {open && (
        <div className="clay-card !rounded-[28px] p-3.5 shadow-soft space-y-2 animate-pop-in min-w-[240px] origin-bottom-right sm:origin-bottom-left">
          <div className="px-2.5 py-1.5 border-b border-purple-100 dark:border-purple-900/50 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-purple-100 uppercase tracking-wider flex items-center gap-1.5">
              <span>💬</span>
              <span>{t("social.contactUs") || "Contact Us"}</span>
            </span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
          </div>

          {/* Telegram */}
          <a
            href={tgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 hover:bg-[#229ED9] text-[#229ED9] hover:text-white transition-all duration-200 group border border-sky-100 dark:border-sky-900/40"
          >
            <div className="w-8 h-8 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-110">
              <TelegramIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight">{t("social.telegram")}</p>
              <p className="text-[10px] opacity-80 leading-tight">{t("social.chatWithUs")}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* WhatsApp */}
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all duration-200 group border border-emerald-100 dark:border-emerald-900/40"
            >
              <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-110">
                <WhatsAppIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight">{t("social.whatsapp")}</p>
                <p className="text-[10px] opacity-80 leading-tight">{t("social.chatWithUs")}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          )}

          {/* Facebook */}
          <a
            href={fbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 hover:bg-[#1877F2] text-[#1877F2] hover:text-white transition-all duration-200 group border border-blue-100 dark:border-blue-900/40"
          >
            <div className="w-8 h-8 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-110">
              <FacebookIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight">{t("social.facebook")}</p>
              <p className="text-[10px] opacity-80 leading-tight">{t("social.visitPageMsg")}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Instagram */}
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/40 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 text-pink-600 hover:text-white transition-all duration-200 group border border-pink-100 dark:border-pink-900/40"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-110">
              <InstagramIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight">{t("social.instagram")}</p>
              <p className="text-[10px] opacity-80 leading-tight">{t("social.followStore")}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* TikTok */}
          {ttUrl && (
            <a
              href={ttUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 hover:bg-[#010101] text-[#010101] dark:text-slate-300 hover:text-white transition-all duration-200 group border border-slate-100 dark:border-slate-900/40"
            >
              <div className="w-8 h-8 rounded-xl bg-[#010101] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-110">
                <TikTokIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight">{t("social.tiktok")}</p>
                <p className="text-[10px] opacity-80 leading-tight">{t("social.followVideos")}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          )}

          {/* Google Maps Store Location */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white transition-all duration-200 group border border-rose-100 dark:border-rose-900/40"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-110">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight">
                {t("social.storeLocation")}
              </p>
              <p className="text-[10px] opacity-80 leading-tight truncate">
                {t("social.openMap")}
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Phone call if provided */}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/40 hover:bg-pink-500 text-pink-700 dark:text-pink-300 hover:text-white transition-all duration-200 group border border-pink-100 dark:border-pink-900/40"
            >
              <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-110">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight">{t("social.callUs")}</p>
                <p className="text-[10px] opacity-80 leading-tight truncate">{phone}</p>
              </div>
            </a>
          )}
        </div>
      )}

      {/* Main floating trigger button */}
      <div className="flex items-center gap-2 flex-row-reverse sm:flex-row">
        {!open && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#120e1a]/95 shadow-soft border border-purple-200 dark:border-purple-900 text-xs font-bold text-slate-700 dark:text-purple-200 animate-fade-in backdrop-blur-md pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            <span>✨ Telegram · WhatsApp · TikTok · Maps ✨</span>
          </span>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={t("social.channelsAria")}
          className={`relative h-13 w-13 rounded-2xl flex items-center justify-center shadow-soft transition-all duration-300 active:scale-95 group ${
            open
              ? "clay-circle-btn !rounded-2xl text-slate-800 dark:text-white rotate-90"
              : "clay-nav-active text-white hover:scale-105 animate-bounce-soft"
          }`}
        >
          {open ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <div className="relative flex items-center justify-center">
              <TelegramIcon className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-300 rounded-full ring-2 ring-white" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
