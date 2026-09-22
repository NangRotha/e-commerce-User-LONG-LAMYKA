import { Link } from "react-router-dom";
import { ShoppingBag, ShieldCheck, Heart, Send, Phone, ExternalLink, MapPin } from "lucide-react";
import useSiteSettings from "../hooks/useSiteSettings";
import { useI18n } from "../i18n/I18nContext";
import { TelegramIcon, FacebookIcon, InstagramIcon, WhatsAppIcon, TikTokIcon } from "./SocialIcons";
import { normalizeTelegram, normalizeFacebook, normalizeInstagram, normalizeWhatsApp, normalizeTikTok } from "../lib/social";
import { STORE_LOCATION } from "../lib/location";

/**
 * Footer — Modern Multi-Column E-Commerce Footer
 * ✅ Brand story & verified trust
 * ✅ Social community cards (Telegram · Facebook · Instagram)
 * ✅ Quick shopping links & Customer care
 * ✅ Payment security & Cambodia banking support
 */
export default function Footer() {
  const s = useSiteSettings();
  const { t, isKhmer } = useI18n();
  const siteName = s.site_name || "E-Commerce Store";
  const siteLogo = s.site_logo || "";

  const tgUrl = normalizeTelegram(s.social_telegram || s.telegram_url);
  const waUrl = normalizeWhatsApp(s.social_whatsapp || s.whatsapp_url || (s.contact_phone ? s.contact_phone : ""));
  const fbUrl = normalizeFacebook(s.social_facebook || s.facebook_url);
  const igUrl = normalizeInstagram(s.social_instagram || s.instagram_url);
  const ttUrl = normalizeTikTok(s.social_tiktok);
  const phone = (s.contact_phone || "").trim();
  const mapsUrl = s.store_maps_url || STORE_LOCATION.mapsUrl;

  return (
    <footer className="bg-[#120B16] text-slate-300 border-t-2 border-pink-950/40 mt-20 transition-colors">
      {/* Top Banner inside Footer */}
      <div className="border-b border-pink-950/40 bg-[#1A1020]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>🎀</span>
                <span>{t("footer.guarantee") || "100% Authentic Cute Products"}</span>
              </p>
              <p className="text-xs text-pink-200/70 font-medium">
                {t("trust.deliveryDesc") || "Fast Sweet Delivery 25 Provinces"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-pink-950/60 border border-pink-500/30 text-pink-200 shadow-soft">
            <span>🇰🇭</span>
            <span>{t("footer.payWith") || "Bakong KHQR · All Bank Wallets ✨"}</span>
          </div>
        </div>
      </div>

      {/* Main 4-column footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Col 1: Brand & Store Location */}
          <div className="space-y-4">
            <Link
              to="/"
              className="group flex items-center gap-2.5 text-xl font-black text-white"
            >
              {siteLogo ? (
                <img
                  src={siteLogo}
                  alt={siteName}
                  className="h-9 w-auto max-w-[150px] object-contain transition-transform group-hover:scale-105"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-400 to-pink-500 text-white shadow-cute-glow flex items-center justify-center">
                  <span className="text-base">🎀</span>
                </div>
              )}
              <span className="tracking-tight bg-gradient-to-r from-white via-pink-100 to-pink-200 bg-clip-text text-transparent">{siteName}</span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              {t("footer.tagline")}
            </p>

            {phone && (
              <div className="pt-1">
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-pink-400 hover:text-pink-300 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{phone}</span>
                </a>
              </div>
            )}

            {/* Store Location & Google Maps Link */}
            <div className="pt-3 border-t border-pink-950/40 space-y-1.5 text-xs text-slate-400">
              <p className="font-bold text-pink-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>{t("location.address") || "Store Location"}</span>
              </p>
              <p className="leading-relaxed text-[11px] text-slate-300 font-medium">
                {isKhmer ? STORE_LOCATION.addressKm : STORE_LOCATION.addressEn}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-400 hover:text-pink-300 transition-colors pt-0.5"
              >
                <span>{t("location.openInMaps") || "Open in Google Maps"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-pink-200 flex items-center gap-1.5">
              <span>🌸</span>
              <span>{t("footer.shop") || "Shop"}</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-400 font-medium">
              <li>
                <Link to="/" className="hover:text-pink-300 transition-colors flex items-center gap-1.5">
                  <span className="text-pink-400 text-xs">›</span>
                  <span>{t("nav.shop")}</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-pink-300 transition-colors flex items-center gap-1.5">
                  <span className="text-pink-400 text-xs">›</span>
                  <span>{t("nav.cart")}</span>
                </Link>
              </li>
              <li>
                <a href="#products" className="hover:text-pink-300 transition-colors flex items-center gap-1.5">
                  <span className="text-pink-400 text-xs">›</span>
                  <span>{t("home.featured")}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-pink-200 flex items-center gap-1.5">
              <span>💖</span>
              <span>{t("footer.customerCare") || "Customer Care"}</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-400 font-medium">
              <li className="flex items-center gap-1.5">
                <span className="text-pink-400 text-xs">›</span>
                <span>{t("trust.deliveryTitle") || "Fast Nationwide Delivery"}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-pink-400 text-xs">›</span>
                <span>{t("trust.qualityTitle") || "100% Quality Guaranteed"}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-pink-400 text-xs">›</span>
                <span>{t("trust.khqrTitle") || "Instant KHQR Payment"}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-pink-400 text-xs">›</span>
                <span>{t("trust.supportTitle") || "24/7 Friendly Support"}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Connect With Us (Telegram, Facebook, Instagram) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-pink-200 flex items-center gap-2">
              <Send className="w-4 h-4 text-pink-400" />
              <span>{t("footer.followUs") || "Connect With Us"}</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {t("social.communityHint") || "Follow our channels for new arrivals & direct orders."}
            </p>

            <div className="flex flex-col gap-2 pt-1">
              {/* Telegram */}
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#1A1020] hover:bg-[#229ED9] text-slate-200 hover:text-white border border-pink-950/40 hover:border-[#229ED9] transition-all duration-200 group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <TelegramIcon className="w-4 h-4 text-[#229ED9] group-hover:text-white transition-colors" />
                  <span className="text-xs font-bold">Telegram Channel</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </a>

              {/* WhatsApp */}
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#1A1020] hover:bg-[#25D366] text-slate-200 hover:text-white border border-pink-950/40 hover:border-[#25D366] transition-all duration-200 group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:text-white transition-colors" />
                    <span className="text-xs font-bold">WhatsApp Chat</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </a>
              )}

              {/* Facebook */}
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#1A1020] hover:bg-[#1877F2] text-slate-200 hover:text-white border border-pink-950/40 hover:border-[#1877F2] transition-all duration-200 group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <FacebookIcon className="w-4 h-4 text-[#1877F2] group-hover:text-white transition-colors" />
                  <span className="text-xs font-bold">Facebook Page</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </a>

              {/* Instagram */}
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#1A1020] hover:bg-gradient-to-r hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 text-slate-200 hover:text-white border border-pink-950/40 hover:border-transparent transition-all duration-200 group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <InstagramIcon className="w-4 h-4 text-pink-400 group-hover:text-white transition-colors" />
                  <span className="text-xs font-bold">Instagram</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </a>

              {/* TikTok */}
              {ttUrl && (
                <a
                  href={ttUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#1A1020] hover:bg-[#010101] text-slate-200 hover:text-white border border-pink-950/40 hover:border-slate-800 transition-all duration-200 group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <TikTokIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    <span className="text-xs font-bold">TikTok</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-pink-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} {siteName}. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-1.5 font-medium">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-cute-bounce inline" />
            <span>for cute girls in</span>
            <span className="text-pink-300 font-bold">Cambodia 🇰🇭</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
