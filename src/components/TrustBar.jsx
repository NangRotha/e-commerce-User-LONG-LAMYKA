import { Truck, ShieldCheck, QrCode, MessageSquareHeart } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

export default function TrustBar() {
  const { t } = useI18n();

  const items = [
    {
      icon: Truck,
      title: t("trust.deliveryTitle") || "Fast Delivery",
      desc: t("trust.deliveryDesc") || "Nationwide 25 provinces",
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: ShieldCheck,
      title: t("trust.qualityTitle") || "100% Authentic",
      desc: t("trust.qualityDesc") || "Top quality guarantee",
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    },
    {
      icon: QrCode,
      title: t("trust.khqrTitle") || "Instant KHQR Pay",
      desc: t("trust.khqrDesc") || "Bakong & all mobile banking",
      color: "from-rose-500 to-red-600",
      bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
    },
    {
      icon: MessageSquareHeart,
      title: t("trust.supportTitle") || "Telegram & FB Support",
      desc: t("trust.supportDesc") || "Instant replies & guidance",
      color: "from-sky-500 to-[#229ED9]",
      bg: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 pb-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 sm:gap-3.5 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group min-w-0"
          >
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl ${item.bg} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110`}
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[11px] sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                {item.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
