import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Heart,
  Send,
  Phone,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import useSiteSettings from "../hooks/useSiteSettings";
import { useI18n } from "../i18n/I18nContext";
import {
  TelegramIcon,
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  TikTokIcon,
} from "./SocialIcons";
import {
  normalizeTelegram,
  normalizeFacebook,
  normalizeInstagram,
  normalizeWhatsApp,
  normalizeTikTok,
} from "../lib/social";
import { STORE_LOCATION } from "../lib/location";

/**
 * Footer — Sweet Boutique E-Commerce Footer
 * 🌸 Light pink aesthetic with smooth gradient & ambient pastel glow
 * ✨ Lively micro-animations: heartbeat, soft bounce, sparkle, hover lift
 * 🎀 Verified trust guarantee & KHQR banking badge
 * 💖 Customer care & Social community links
 */
export default function Footer() {
  const s = useSiteSettings();
  const { t, isKhmer } = useI18n();
  const siteName = s.site_name || "LONG LAMYKA";
  const siteLogo = s.site_logo || "";

  const tgUrl = normalizeTelegram(s.social_telegram || s.telegram_url);
  const waUrl = normalizeWhatsApp(
    s.social_whatsapp || s.whatsapp_url || (s.contact_phone ? s.contact_phone : "")
  );
  const fbUrl = normalizeFacebook(s.social_facebook || s.facebook_url);
  const igUrl = normalizeInstagram(s.social_instagram || s.instagram_url);
  const ttUrl = normalizeTikTok(s.social_tiktok);
  const phone = (s.contact_phone || "").trim();
  const mapsUrl = s.store_maps_url || STORE_LOCATION.mapsUrl;
  const address = isKhmer
    ? s.store_address_km || STORE_LOCATION.addressKm
    : s.store_address_en || STORE_LOCATION.addressEn;

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-[#FFEAF1] to-[#FFDEEB] dark:bg-gradient-to-b dark:from-[#1b1022] dark:via-[#160b1c] dark:to-[#0f0714] text-slate-700 dark:text-slate-300 border-t border-pink-200/90 dark:border-pink-950/50 mt-20 transition-colors font-sans">
      {/* Floating cute ambient background glow orbs */}
      <div className="absolute -top-24 left-10 w-96 h-96 rounded-full bg-pink-300/35 dark:bg-pink-600/10 blur-3xl pointer-events-none animate-float" />
      <div
        className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-rose-200/40 dark:bg-purple-600/10 blur-3xl pointer-events-none animate-float"
        style={{ animationDelay: "2.5s" }}
      />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-purple-200/25 dark:bg-rose-900/10 blur-3xl pointer-events-none animate-pulse-soft" />

      {/* Top Banner inside Footer */}
      <div className="border-b border-pink-200/70 dark:border-pink-950/40 bg-white/75 dark:bg-white/[0.03] backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-400 to-pink-500 text-white shadow-md shadow-pink-500/25 flex items-center justify-center shrink-0 animate-cute-bounce">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🎀</span>
                <span>{t("footer.guarantee") || "100% Authentic Products"}</span>
              </p>
              <p className="text-xs text-pink-700 dark:text-pink-300/80 font-bold">
                {t("trust.deliveryDesc") || "Fast Sweet Delivery 25 Provinces"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-[#1f1528] border border-pink-300/70 dark:border-pink-500/30 text-pink-700 dark:text-pink-200 shadow-soft hover:shadow-marshmallow hover:scale-105 transition-all duration-300 cursor-default backdrop-blur-xs">
            <span>🇰🇭</span>
            <span>{t("footer.payWith") || "Bakong KHQR · All Bank Wallets ✨"}</span>
          </div>
        </div>
      </div>

      {/* Main 4-column footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Col 1: Brand & Store Location */}
          <div className="space-y-4">
            <Link
              to="/"
              className="group flex items-center gap-3 text-xl font-black"
            >
              <div
                className="w-12 h-12 rounded-full overflow-hidden shadow-marshmallow bg-pink-100 shrink-0 border-2 border-white dark:border-pink-400/50 hover:rotate-6 hover:scale-110 transition-transform duration-300"
              >
                <img
                  src={siteLogo || "/avatar_clay.jpg"}
                  alt={siteName}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.target.src = "/avatar_clay.jpg";
                  }}
                />
              </div>
              <span className="tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 dark:from-pink-300 dark:via-rose-200 dark:to-purple-200 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity font-black text-2xl flex items-center gap-1.5">
                <span>{siteName}</span>
                <Sparkles className="w-4 h-4 text-pink-500 dark:text-pink-400 animate-sparkle shrink-0" />
              </span>
            </Link>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {t("footer.tagline")}
            </p>

            {phone && (
              <div className="pt-1">
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 bg-white/85 dark:bg-pink-950/40 border border-pink-200/80 dark:border-pink-900/60 px-3.5 py-2 rounded-full shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95 transition-all group"
                >
                  <Phone className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                  <span>{phone}</span>
                </a>
              </div>
            )}

            {/* Store Location & Google Maps Link */}
            <div className="pt-3 border-t border-pink-200/70 dark:border-pink-950/40 space-y-1.5 text-xs bg-white/50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-pink-100/80 dark:border-pink-950/30 backdrop-blur-xs shadow-2xs">
              <p className="font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0 animate-bounce-soft" />
                <span>{t("location.address") || "Store Location"}</span>
              </p>
              <p className="leading-relaxed text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                {address}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors pt-0.5 group"
              >
                <span>{t("location.openInMaps") || "Open in Google Maps"}</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
              <span>🌸</span>
              <span>{t("footer.shop") || "Shop"}</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-semibold">
              <li>
                <Link
                  to="/"
                  className="hover:text-pink-600 dark:hover:text-pink-300 transition-colors flex items-center gap-2 group py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 group-hover:w-3 group-hover:bg-pink-600 transition-all duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform">{t("nav.shop")}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="hover:text-pink-600 dark:hover:text-pink-300 transition-colors flex items-center gap-2 group py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 group-hover:w-3 group-hover:bg-pink-600 transition-all duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform">{t("nav.cart")}</span>
                </Link>
              </li>
              <li>
                <a
                  href="#products"
                  className="hover:text-pink-600 dark:hover:text-pink-300 transition-colors flex items-center gap-2 group py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 group-hover:w-3 group-hover:bg-pink-600 transition-all duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform">{t("home.featured")}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
              <span>💖</span>
              <span>{t("footer.customerCare") || "Customer Care"}</span>
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400 font-semibold">
              <li className="flex items-center gap-2.5 group">
                <span className="w-5 h-5 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center text-[10px] shrink-0 font-bold group-hover:scale-110 group-hover:bg-pink-200 transition-all">
                  ✨
                </span>
                <span className="group-hover:translate-x-1 transition-transform">
                  {t("trust.deliveryTitle") || "Fast Nationwide Delivery"}
                </span>
              </li>
              <li className="flex items-center gap-2.5 group">
                <span className="w-5 h-5 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center text-[10px] shrink-0 font-bold group-hover:scale-110 group-hover:bg-pink-200 transition-all">
                  🎀
                </span>
                <span className="group-hover:translate-x-1 transition-transform">
                  {t("trust.qualityTitle") || "100% Quality Guaranteed"}
                </span>
              </li>
              <li className="flex items-center gap-2.5 group">
                <span className="w-5 h-5 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center text-[10px] shrink-0 font-bold group-hover:scale-110 group-hover:bg-pink-200 transition-all">
                  💳
                </span>
                <span className="group-hover:translate-x-1 transition-transform">
                  {t("trust.khqrTitle") || "Instant KHQR Payment"}
                </span>
              </li>
              <li className="flex items-center gap-2.5 group">
                <span className="w-5 h-5 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center text-[10px] shrink-0 font-bold group-hover:scale-110 group-hover:bg-pink-200 transition-all">
                  💬
                </span>
                <span className="group-hover:translate-x-1 transition-transform">
                  {t("trust.supportTitle") || "24/7 Friendly Support"}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Connect With Us (Telegram, Facebook, Instagram, WhatsApp, TikTok) */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-pink-700 dark:text-pink-300 flex items-center gap-2">
              <Send className="w-4 h-4 text-pink-500 animate-wiggle" />
              <span>{t("footer.followUs") || "Connect With Us"}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {t("social.communityHint") || "Follow our channels for new arrivals & direct orders."}
            </p>

            <div className="flex flex-col gap-2 pt-1">
              {/* Telegram */}
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/85 dark:bg-[#1f1325]/80 hover:bg-[#229ED9] dark:hover:bg-[#229ED9] text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white border border-pink-200/80 dark:border-pink-900/40 hover:border-[#229ED9] transition-all duration-300 group shadow-2xs hover:shadow-marshmallow hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2.5">
                  <TelegramIcon className="w-4 h-4 text-[#229ED9] group-hover:text-white group-hover:scale-110 transition-all" />
                  <span className="text-xs font-bold">{t("footer.tgChannel")}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </a>

              {/* WhatsApp */}
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/85 dark:bg-[#1f1325]/80 hover:bg-[#25D366] dark:hover:bg-[#25D366] text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white border border-pink-200/80 dark:border-pink-900/40 hover:border-[#25D366] transition-all duration-300 group shadow-2xs hover:shadow-marshmallow hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:text-white group-hover:scale-110 transition-all" />
                    <span className="text-xs font-bold">{t("footer.waChat")}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
              )}

              {/* Facebook */}
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/85 dark:bg-[#1f1325]/80 hover:bg-[#1877F2] dark:hover:bg-[#1877F2] text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white border border-pink-200/80 dark:border-pink-900/40 hover:border-[#1877F2] transition-all duration-300 group shadow-2xs hover:shadow-marshmallow hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2.5">
                  <FacebookIcon className="w-4 h-4 text-[#1877F2] group-hover:text-white group-hover:scale-110 transition-all" />
                  <span className="text-xs font-bold">{t("footer.fbPage")}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </a>

              {/* Instagram */}
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/85 dark:bg-[#1f1325]/80 hover:bg-gradient-to-r hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white border border-pink-200/80 dark:border-pink-900/40 hover:border-transparent transition-all duration-300 group shadow-2xs hover:shadow-marshmallow hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2.5">
                  <InstagramIcon className="w-4 h-4 text-pink-500 group-hover:text-white group-hover:scale-110 transition-all" />
                  <span className="text-xs font-bold">{t("social.instagram")}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </a>

              {/* TikTok */}
              {ttUrl && (
                <a
                  href={ttUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/85 dark:bg-[#1f1325]/80 hover:bg-[#010101] dark:hover:bg-[#010101] text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white border border-pink-200/80 dark:border-pink-900/40 hover:border-slate-800 transition-all duration-300 group shadow-2xs hover:shadow-marshmallow hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <TikTokIcon className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                    <span className="text-xs font-bold">{t("social.tiktok")}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-pink-200/80 dark:border-pink-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <p className="font-medium">
            © {new Date().getFullYear()} <span className="font-bold text-pink-700 dark:text-pink-300">{siteName}</span>. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-1.5 font-medium flex-wrap justify-center sm:justify-end">
            <span>{t("footer.craftedWith")}</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-heartbeat inline hover:scale-125 transition-transform cursor-pointer" />
            <span>{t("footer.forLovedOnes") || t("footer.forCuteGirlsIn")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
