import { Truck, ShieldCheck, QrCode, MessageSquareHeart } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

export default function TrustBar() {
  const { t } = useI18n();

  const items = [
    {
      emoji: "🚚",
      title: t("trust.deliveryTitle") || "Cute Fast Delivery",
      desc: t("trust.deliveryDesc") || "Nationwide 25 provinces 🌸",
      bg: "bg-pink-100/80 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300",
    },
    {
      emoji: "🎀",
      title: t("trust.qualityTitle") || "100% Authentic",
      desc: t("trust.qualityDesc") || "Guaranteed with love ✨",
      bg: "bg-purple-100/80 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300",
    },
    {
      emoji: "🇰🇭",
      title: t("trust.khqrTitle") || "Instant KHQR Pay",
      desc: t("trust.khqrDesc") || "Bakong & Mobile Banking 💖",
      bg: "bg-rose-100/80 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300",
    },
    {
      emoji: "💬",
      title: t("trust.supportTitle") || "Friendly Support",
      desc: t("trust.supportDesc") || "Telegram & FB chat 🎀",
      bg: "bg-amber-100/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 pb-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 p-3 sm:p-5 rounded-3xl sm:rounded-[32px] bg-white/90 dark:bg-[#1A1220]/90 backdrop-blur-xl border border-pink-100/90 dark:border-pink-950/60 shadow-marshmallow">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 sm:gap-3.5 p-2 sm:p-3 rounded-2xl sm:rounded-[24px] hover:bg-pink-50/70 dark:hover:bg-pink-950/30 transition-all duration-300 group min-w-0 hover:scale-102"
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl sm:rounded-[20px] ${item.bg} flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
            >
              <span>{item.emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-pink-100 truncate">
                {item.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-pink-600/80 dark:text-pink-300/70 font-semibold truncate mt-0.5">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
