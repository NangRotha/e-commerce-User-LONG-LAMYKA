import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/helpers";
import { useI18n } from "../i18n/I18nContext";

/** Cart — កន្ត្រកទំនិញ (បកប្រែ km/en + animation រលូន) */
export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, count } = useCart();
  const { t } = useI18n();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in-up">
        <div className="text-6xl mb-4 animate-bounce-soft">🛒</div>
        <h1 className="text-2xl font-bold text-slate-800">{t("cart.empty")}</h1>
        <p className="mt-2 text-slate-500">{t("cart.emptyHint")}</p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition-all duration-200 hover:bg-emerald-700 hover:shadow-lift active:scale-95"
        >
          {t("cart.continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
        {t("cart.title")}{" "}
        <span className="text-base font-medium text-slate-500">
          ({t("cart.itemsCount", { count })})
        </span>
      </h1>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4 flex gap-4 transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5 animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}
            >
              <Link
                to={`/product/${item.id}`}
                className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 group"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    📦
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      to={`/product/${item.id}`}
                      className="font-semibold text-slate-800 hover:text-emerald-600 transition-colors duration-200 line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-slate-500">
                      {formatPrice(item.price)} {t("cart.each")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 transition-all duration-200 text-sm font-medium active:scale-90"
                    aria-label={t("cart.remove")}
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 transition-colors duration-200 active:scale-90"
                      aria-label={t("product.decrease")}
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 font-semibold min-w-8 text-center border-x border-slate-300 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 transition-colors duration-200 active:scale-90"
                      aria-label={t("product.increase")}
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div
          className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 h-fit lg:sticky lg:top-24 animate-fade-in-up transition-shadow duration-300 hover:shadow-lift"
          style={{ animationDelay: "150ms" }}
        >
          <h2 className="text-lg font-bold text-slate-900">
            {t("cart.orderSummary")}
          </h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{t("cart.subtotal", { count })}</span>
              <span className="font-semibold text-slate-900">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t("cart.shipping")}</span>
              <span className="text-emerald-600 font-medium">
                {t("cart.free")}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-lg font-bold text-slate-900">
            <span>{t("cart.total")}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block w-full text-center px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition-all duration-200 hover:bg-emerald-700 hover:shadow-lift active:scale-[0.98]"
          >
            {t("cart.checkout")}
          </Link>
          <Link
            to="/"
            className="mt-3 block w-full text-center px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
          >
            {t("cart.continueShopping")}
          </Link>

          <p className="mt-4 text-center text-xs text-slate-400">
            🏦 {t("footer.payWith")}
          </p>
        </div>
      </div>
    </div>
  );
}
