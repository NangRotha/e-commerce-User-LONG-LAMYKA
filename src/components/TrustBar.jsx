import { CheckmarkBox3D, Calendar3D, Flag3D, Star3D } from "./ClayIcons";
import { useI18n } from "../i18n/I18nContext";

/**
 * TrustBar — 4 Claymorphic Pastel Cards Matching Frontend-Admin Dashboard
 * Features CheckmarkBox3D, Calendar3D, Flag3D, and Star3D with smooth lift hover.
 */
export default function TrustBar() {
  const { t } = useI18n();

  const cards = [
    {
      icon: <CheckmarkBox3D className="w-10 h-10 sm:w-11 sm:h-11" />,
      title: t("trust.deliveryTitle") || "ដឹកជញ្ជូនរហ័ស",
      subtitle: t("trust.deliveryDesc") || "គ្រប់ ២៥ ខេត្ត-ក្រុង",
      tag: "រហ័ស & ទុកចិត្តបាន",
      cardCls: "clay-card-purple",
      textCls: "text-purple-700 dark:text-purple-300",
      tagCls: "bg-purple-200/60 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
    },
    {
      icon: <Calendar3D className="w-10 h-10 sm:w-11 sm:h-11" />,
      title: t("trust.qualityTitle") || "ផលិតផលសុទ្ធ ១០០%",
      subtitle: t("trust.qualityDesc") || "ធានាគុណភាពខ្ពស់",
      tag: "ធានា ១០០%",
      cardCls: "clay-card-pink",
      textCls: "text-rose-600 dark:text-rose-300",
      tagCls: "bg-rose-200/60 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    },
    {
      icon: <Flag3D className="w-10 h-10 sm:w-11 sm:h-11" />,
      title: t("trust.supportTitle") || "សេវាកម្ម ២៤/៧",
      subtitle: t("trust.supportDesc") || "ឆាតរហ័សទាន់ចិត្ត",
      tag: "ឆ្លើយតបរហ័ស",
      cardCls: "clay-card-mint",
      textCls: "text-emerald-700 dark:text-emerald-300",
      tagCls: "bg-emerald-200/60 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    },
    {
      icon: <Star3D className="w-10 h-10 sm:w-11 sm:h-11" />,
      title: t("trust.khqrTitle") || "បង់ប្រាក់ KHQR",
      subtitle: t("trust.khqrDesc") || "Bakong & គ្រប់ធនាគារ",
      tag: "ស្កេនបង់ប្រាក់",
      cardCls: "clay-card-yellow",
      textCls: "text-amber-700 dark:text-amber-300",
      tagCls: "bg-amber-200/60 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-5 pb-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
        {cards.map((c, idx) => (
          <div
            key={idx}
            className={`${c.cardCls} p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden group cursor-default shadow-soft`}
          >
            {/* Left: 3D Clay Icon */}
            <div className="shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              {c.icon}
            </div>

            {/* Right: Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${c.tagCls}`}>
                  {c.tag}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white truncate mt-1 leading-snug">
                {c.title}
              </h3>
              <p className={`text-[11px] font-bold ${c.textCls} truncate mt-0.5`}>
                {c.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
