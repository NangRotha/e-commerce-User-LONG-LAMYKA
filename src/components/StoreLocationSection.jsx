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
import { STORE_LOCATION } from "../lib/location";
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
      <div className="rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-white/90 via-slate-50/70 to-emerald-50/30 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 lg:p-10 shadow-soft backdrop-blur-xl relative overflow-hidden">
        {/* Ambient subtle glow background */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200/70 dark:border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("location.badge")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("location.title")}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              {t("location.subtitle")}
            </p>
          </div>

          {/* Quick Google Maps CTA in header */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 hover:shadow-lift transition-all duration-200 active:scale-95 shrink-0"
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
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {t("location.address")}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                    title={t("location.copyAddress")}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">
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
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                  {address}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  📍 {STORE_LOCATION.areaKm} ({STORE_LOCATION.lat},{" "}
                  {STORE_LOCATION.lng})
                </p>
              </div>

              {/* Hours Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {t("location.hours")}
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {isKhmer ? STORE_LOCATION.hoursKm : STORE_LOCATION.hoursEn}
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {isKhmer
                      ? "បើកទទួលអតិថិជនជារៀងរាល់ថ្ងៃ"
                      : "Open Everyday for Walk-ins & Orders"}
                  </span>
                </div>
              </div>

              {/* Delivery info */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  {t("location.delivery")}
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  {isKhmer
                    ? STORE_LOCATION.deliveryKm
                    : STORE_LOCATION.deliveryEn}
                </p>
              </div>

              {/* Phone / WhatsApp if configured */}
              {(phone || waUrl) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 truncate">
                      <p className="text-xs text-slate-400 font-medium">
                        {isKhmer ? "ទំនាក់ទំនងហាងផ្ទាល់" : "Direct Contact"}
                      </p>
                      {phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="text-sm font-bold text-slate-800 dark:text-white hover:text-emerald-600 transition truncate block"
                        >
                          {phone}
                        </a>
                      ) : (
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
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
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-emerald-200/60 dark:border-emerald-800 text-xs font-semibold transition active:scale-95 flex items-center gap-1"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {phone && (
                      <a
                        href={`tel:${phone}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold hover:bg-emerald-600 hover:text-white transition active:scale-95"
                      >
                        {isKhmer ? "ទូរស័ព្ទ" : "Call"}
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
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:shadow-lift active:scale-95"
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{t("location.openInMaps")}</span>
              </a>

              <a
                href={STORE_LOCATION.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95"
              >
                <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{t("location.getDirections")}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Map Preview */}
          <div className="lg:col-span-7 min-h-[360px] sm:min-h-[420px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md relative group flex flex-col">
            {/* Embedded Live Map */}
            <iframe
              title="Store Location Map"
              src={STORE_LOCATION.osmEmbedUrl}
              className="w-full h-full min-h-[340px] sm:min-h-[400px] border-0 flex-1 bg-slate-100 dark:bg-slate-950"
              loading="lazy"
            />

            {/* Floating Info Overlay on top of the Map */}
            <div className="absolute top-3 left-3 right-3 sm:right-auto flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-slate-200/80 dark:border-slate-800 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  {isKhmer ? "ទីតាំងហាងយើងនៅទីនេះ" : "Our Store Pin"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:inline">
                • {STORE_LOCATION.areaKm}
              </span>
            </div>

            {/* Bottom floating direct-action bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Google Maps</p>
                  <p className="text-[10px] text-slate-300 truncate">
                    11.5385935, 104.8904647
                  </p>
                </div>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all duration-200 active:scale-95 shrink-0"
              >
                <span>{isKhmer ? "បើកផែនទី" : "Open Maps"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
