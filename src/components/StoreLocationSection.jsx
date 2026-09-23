import { useState } from "react";
import {
  MapPin,
  Clock,
  Truck,
  ExternalLink,
  Navigation,
  Copy,
  Check,
  Phone,
  Sparkles,
} from "lucide-react";
import { STORE_LOCATION, resolveMapEmbedUrl } from "../lib/location";
import { useI18n } from "../i18n/I18nContext";
import useSiteSettings from "../hooks/useSiteSettings";
import { WhatsAppIcon } from "./SocialIcons";
import { normalizeWhatsApp } from "../lib/social";

export default function StoreLocationSection() {
  const { t, isKhmer } = useI18n();
  const settings = useSiteSettings();
  const [copied, setCopied] = useState(false);

  const mapsUrl = settings.store_maps_url || STORE_LOCATION.mapsUrl;
  const address = isKhmer
    ? settings.store_address_km || STORE_LOCATION.addressKm
    : settings.store_address_en || STORE_LOCATION.addressEn;
  const hours = isKhmer
    ? settings.store_hours_km || STORE_LOCATION.hoursKm
    : settings.store_hours_en || STORE_LOCATION.hoursEn;
  const delivery = isKhmer
    ? settings.store_delivery_km || STORE_LOCATION.deliveryKm
    : settings.store_delivery_en || STORE_LOCATION.deliveryEn;
  const embedUrl = resolveMapEmbedUrl(settings.store_maps_embed_url);
  const isCustomGoogleEmbed = Boolean(
    settings.store_maps_embed_url &&
      settings.store_maps_embed_url.includes("google.com/maps")
  );
  const directionsUrl = mapsUrl || STORE_LOCATION.directionsUrl;
  const phone = (settings.contact_phone || "").trim();
  const waUrl = normalizeWhatsApp(settings.social_whatsapp || settings.whatsapp_url || phone);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <section id="location" className="mt-16 sm:mt-24 scroll-mt-24">
      <div className="rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-white/95 via-pink-50/50 to-rose-50/30 dark:from-[#1E1324]/95 dark:via-[#19101F]/80 dark:to-pink-950/30 border-2 border-pink-100 dark:border-pink-900/50 p-6 sm:p-10 shadow-marshmallow backdrop-blur-xl relative overflow-hidden">
        {/* Ambient subtle glow background */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-pink-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-rose-400/15 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-pink-100 dark:border-pink-900/50">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/80 dark:bg-pink-950/80 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 text-xs font-bold mb-3 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
              <span>🌸 {t("location.badge")} ✨</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-pink-100 tracking-tight flex items-center gap-2">
              <span>{t("location.title")}</span>
              <span className="text-pink-400">🎀</span>
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 max-w-xl font-medium">
              {t("location.subtitle")}
            </p>
          </div>

          {/* Quick Google Maps CTA in header */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-cute-glow transition-all duration-200 active:scale-95 shrink-0"
          >
            <span>{t("location.openInMaps")}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* 2-Column Content Grid */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-8 items-stretch">
          {/* Left Column: Details & Contact */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              {/* Address Card */}
              <div className="p-5 rounded-[24px] bg-white dark:bg-[#1E1324] border-2 border-pink-100 dark:border-pink-900/50 shadow-soft space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {t("location.address")}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 transition"
                    title={t("location.copyAddress")}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                        <span className="text-pink-600 dark:text-pink-400">
                          {t("location.copied")}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t("location.copyAddress")}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-pink-100 leading-relaxed">
                  {address}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
                  📍 {t("location.area")} ({STORE_LOCATION.lat},{" "}
                  {STORE_LOCATION.lng})
                </p>
              </div>

              {/* Hours Card */}
              <div className="p-5 rounded-[24px] bg-white dark:bg-[#1E1324] border-2 border-pink-100 dark:border-pink-900/50 shadow-soft space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {t("location.hours")}
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-pink-100">
                  {hours}
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-pink-600 dark:text-pink-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  <span>
                    {t("location.openEveryday")}
                  </span>
                </div>
              </div>

              {/* Delivery info */}
              <div className="p-5 rounded-[24px] bg-white dark:bg-[#1E1324] border-2 border-pink-100 dark:border-pink-900/50 shadow-soft space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  {t("location.delivery")}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-pink-100">
                  {delivery}
                </p>
              </div>

              {/* Phone / WhatsApp if configured */}
              {(phone || waUrl) && (
                <div className="p-5 rounded-[24px] bg-white dark:bg-[#1E1324] border-2 border-pink-100 dark:border-pink-900/50 shadow-soft flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 truncate">
                      <p className="text-xs text-slate-400 font-medium">
                        {t("social.directContact")}
                      </p>
                      {phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="text-sm font-bold text-slate-800 dark:text-pink-100 hover:text-pink-600 transition truncate block"
                        >
                          {phone}
                        </a>
                      ) : (
                        <span className="text-sm font-bold text-slate-800 dark:text-pink-100">
                          WhatsApp
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-full bg-[#25D366]/10 dark:bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 text-xs font-bold transition active:scale-95 flex items-center gap-1"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>{t("social.whatsapp")}</span>
                      </a>
                    )}
                    {phone && (
                      <a
                        href={`tel:${phone}`}
                        className="px-4 py-1.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 text-xs font-bold hover:bg-pink-500 hover:text-white transition active:scale-95"
                      >
                        {t("common.call")}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Bar */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-cute-glow transition-all duration-200 active:scale-95"
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{t("location.openInMaps")}</span>
              </a>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-full bg-white dark:bg-[#1E1324] hover:bg-pink-50 dark:hover:bg-pink-950/40 border-2 border-pink-200 dark:border-pink-800 text-slate-800 dark:text-pink-200 font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 shadow-soft"
              >
                <Navigation className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="truncate">{t("location.getDirections")}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Map Preview */}
          <div className="lg:col-span-7 min-h-[360px] sm:min-h-[420px] rounded-[32px] overflow-hidden border-2 border-pink-100 dark:border-pink-900/50 shadow-marshmallow relative group flex flex-col">
            {/* Embedded Live Map */}
            <iframe
              title={t("location.storeMapTitle")}
              src={embedUrl}
              className="w-full h-full min-h-[340px] sm:min-h-[400px] border-0 flex-1 bg-pink-50/30 dark:bg-slate-950"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Floating Info Overlay on top of the Map */}
            <div className="absolute top-3 left-3 right-3 sm:right-auto flex items-center justify-between sm:justify-start gap-2 px-4 py-2 rounded-full bg-white/95 dark:bg-[#1E1324]/95 backdrop-blur-md shadow-marshmallow border-2 border-pink-200/80 dark:border-pink-900/60 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500" />
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-pink-100">
                  {isCustomGoogleEmbed ? t("location.officialPin") : t("location.storePin")}
                </span>
              </div>
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider hidden sm:inline">
                • {t("location.area")}
              </span>
            </div>

            {/* Bottom floating direct-action bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-[#1E1324]/95 backdrop-blur-md text-slate-800 dark:text-pink-100 border-2 border-pink-200/80 dark:border-pink-900/60 shadow-marshmallow">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center shrink-0 shadow-cute-glow">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{t("location.googleMaps")}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                    11.5385935, 104.8904647
                  </p>
                </div>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold transition-all duration-200 active:scale-95 shrink-0 shadow-cute-glow"
              >
                <span>{t("location.openMaps")}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
