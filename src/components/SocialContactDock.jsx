import { useState } from "react";
import { MessageCircle, X, Phone, Send, ExternalLink, MapPin } from "lucide-react";
import useSiteSettings from "../hooks/useSiteSettings";
import { TelegramIcon, FacebookIcon, InstagramIcon } from "./SocialIcons";
import { normalizeTelegram, normalizeFacebook, normalizeInstagram } from "../lib/social";
import { useI18n } from "../i18n/I18nContext";
import { STORE_LOCATION } from "../lib/location";

export default function SocialContactDock() {
  const s = useSiteSettings();
  const { t, isKhmer } = useI18n();
  const [open, setOpen] = useState(false);

  const tgUrl = normalizeTelegram(s.social_telegram || s.telegram_url);
  const fbUrl = normalizeFacebook(s.social_facebook || s.facebook_url);
  const igUrl = normalizeInstagram(s.social_instagram || s.instagram_url);
  const phone = (s.contact_phone || "").trim();
  const mapsUrl = s.store_maps_url || STORE_LOCATION.mapsUrl;

  return (
    <div className="fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-40 flex flex-col items-start gap-3 pointer-events-auto">
      {/* Expanded popout menu */}
      {open && (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-3 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-2 animate-pop-in min-w-[220px] origin-bottom-left">
          <div className="px-2 py-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              {t("social.contactUs") || "Contact Us"}
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          {/* Telegram */}
          <a
            href={tgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-[#229ED9] text-[#229ED9] hover:text-white transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#229ED9] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
              <TelegramIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight">Telegram</p>
              <p className="text-[10px] opacity-80 leading-tight">Chat with us</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Facebook */}
          <a
            href={fbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-[#1877F2] text-[#1877F2] hover:text-white transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
              <FacebookIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight">Facebook</p>
              <p className="text-[10px] opacity-80 leading-tight">Visit page / message</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Instagram */}
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 text-pink-600 hover:text-white transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
              <InstagramIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight">Instagram</p>
              <p className="text-[10px] opacity-80 leading-tight">Follow our store</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Google Maps Store Location */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight">
                {isKhmer ? "ទីតាំងហាង Google Maps" : "Store Location"}
              </p>
              <p className="text-[10px] opacity-80 leading-tight truncate">
                {isKhmer ? "ភ្នំពេញ · បើកមើលផែនទី" : "Phnom Penh · Open Map"}
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Phone call if provided */}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight">Call Us</p>
                <p className="text-[10px] opacity-80 leading-tight truncate">{phone}</p>
              </div>
            </a>
          )}
        </div>
      )}

      {/* Main floating trigger button */}
      <div className="flex items-center gap-2">
        {!open && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 animate-fade-in backdrop-blur-md pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Telegram · FB · Maps
          </span>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Social Channels & Chat"
          className={`relative h-13 w-13 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 group ${
            open
              ? "bg-slate-800 text-white rotate-90"
              : "bg-gradient-to-tr from-emerald-600 via-teal-500 to-[#229ED9] text-white hover:shadow-emerald-500/30 hover:scale-105 ring-4 ring-emerald-500/20 animate-bounce-soft"
          }`}
        >
          {open ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <div className="relative flex items-center justify-center">
              <TelegramIcon className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
