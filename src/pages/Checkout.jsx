import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import { isValidEmail, isValidPhone } from "../lib/payment";
import { formatPrice } from "../lib/helpers";

const CUSTOMER_KEY = "shop_customer";

/**
 * Checkout — Guest Checkout (គ្មាន Login / Sign Up) ✓
 * អតិថិជនបំពេញឈ្មោះ / លេខទូរស័ព្ទ / អាសយដ្ឋាន រួចបញ្ជាទិញ
 * បន្ទាប់មកទៅទំព័រ Order Success ដើម្បីស្កេន KHQR បង់ប្រាក់ (auto-detect) ✓
 */
export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState(null); // { percent }
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [payment, setPayment] = useState(null);

  // ព័ត៌មាន Bakong Wallet (Company Name / Display Name / Currency) សម្រាប់បង្ហាញ
  useEffect(() => {
    api.getPaymentConfig().then(setPayment).catch(() => {});
  }, []);

  // ចងចាំព័ត៌មានអតិថិជនក្នុង localStorage -> បញ្ជាទិញលើកក្រោយងាយស្រួល
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "{}");
      if (saved.name) setName(saved.name);
      if (saved.phone) setPhone(saved.phone);
      if (saved.email) setEmail(saved.email);
      if (saved.address) setAddress(saved.address);
    } catch {
      /* ignore */
    }
  }, []);

  const applyPromo = async () => {
    setPromoError("");
    setPromo(null);
    setPromoApplied(false);
    if (!promoCode.trim()) return;
    try {
      const data = await api.validatePromo(promoCode.trim());
      setPromo(data);
      setPromoApplied(true);
    } catch (e) {
      setPromoError(e.message);
    }
  };

  const removePromo = () => {
    setPromo(null);
    setPromoApplied(false);
    setPromoCode("");
  };

  const discount = promo ? (subtotal * promo.percent) / 100 : 0;
  const total = Math.max(0, subtotal - discount);

  const placeOrder = async () => {
    setError("");
    if (!name.trim()) return setError(t("checkout.errName"));
    if (!phone.trim()) return setError(t("checkout.errPhone"));
    if (!isValidPhone(phone)) return setError(t("checkout.errPhoneInvalid"));
    if (email.trim() && !isValidEmail(email)) return setError(t("checkout.errEmail"));
    if (!address.trim()) return setError(t("checkout.errAddress"));

    setPlacing(true);
    try {
      const res = await api.checkout({
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim(),
        shipping_address: address.trim(),
        note: note.trim(),
        promo_code: promo ? promoCode.trim() : null,
      });
      try {
        localStorage.setItem(
          CUSTOMER_KEY,
          JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
          })
        );
      } catch {
        /* ignore */
      }
      clear();
      navigate("/order-success", { state: { order: res } });
    } catch (e) {
      setError(e.message);
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in-up">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-slate-800">
          {t("checkout.nothingToCheckout")}
        </h1>
        <p className="mt-2 text-slate-500">{t("checkout.emptyCartHint")}</p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition-all duration-200 hover:bg-emerald-700 hover:shadow-lift active:scale-95"
        >
          {t("cart.continueShopping")}
        </Link>
      </div>
    );
  }

  const input =
    "mt-1.5 w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition duration-200";
  const label = "block text-sm font-medium text-slate-700";
  const card =
    "bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-soft";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t("checkout.title")}
        </h1>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full animate-pop-in">
          ✨ {t("checkout.guestBadge")}
        </span>
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        {/* ===== Form ===== */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${card} animate-fade-in-up`}>
            <h2 className="text-lg font-bold text-slate-900">
              {t("checkout.contact")}
            </h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>{t("checkout.fullName")}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("checkout.fullNamePlaceholder")}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>{t("checkout.phone")}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("checkout.phonePlaceholder")}
                  className={input}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>{t("checkout.email")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("checkout.emailPlaceholder")}
                  className={input}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  {t("checkout.emailHint")}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${card} animate-fade-in-up`}
            style={{ animationDelay: "80ms" }}
          >
            <h2 className="text-lg font-bold text-slate-900">
              {t("checkout.delivery")}
            </h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder={t("checkout.addressPlaceholder")}
              className="mt-4 w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition duration-200"
            />
          </div>

          <div
            className={`${card} animate-fade-in-up`}
            style={{ animationDelay: "140ms" }}
          >
            <h2 className="text-lg font-bold text-slate-900">
              {t("checkout.note")}{" "}
              <span className="text-sm font-normal text-slate-400">
                {t("common.optional")}
              </span>
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={t("checkout.notePlaceholder")}
              className="mt-4 w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition duration-200"
            />
          </div>

          {/* ===== Promo code ===== */}
          <div
            className={`${card} animate-fade-in-up`}
            style={{ animationDelay: "200ms" }}
          >
            <h2 className="text-lg font-bold text-slate-900">
              {t("checkout.promo")}{" "}
              <span className="text-sm font-normal text-slate-400">
                {t("common.optional")}
              </span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t("checkout.promoHint")}</p>
            <div className="mt-4 flex gap-3">
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder={t("checkout.promoPlaceholder")}
                disabled={promoApplied}
                className={`flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 transition duration-200`}
              />
              {promoApplied ? (
                <button
                  type="button"
                  onClick={removePromo}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-all duration-200 active:scale-95"
                >
                  {t("checkout.remove")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyPromo}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all duration-200 active:scale-95"
                >
                  {t("checkout.apply")}
                </button>
              )}
            </div>
            {promoApplied && promo && (
              <p className="mt-3 text-sm text-emerald-600 font-medium animate-pop-in">
                {t("checkout.applied", { percent: promo.percent })}
              </p>
            )}
            {promoError && (
              <p className="mt-3 text-sm text-rose-600 animate-fade-in">
                {promoError}
              </p>
            )}
          </div>

          {/* ===== Payment (Bakong Wallet / KHQR) ===== */}
          <div
            className={`${card} animate-fade-in-up`}
            style={{ animationDelay: "260ms" }}
          >
            <h2 className="text-lg font-bold text-slate-900">
              {t("checkout.payment")}
            </h2>
            <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/70 p-4 transition-all duration-300 hover:shadow-lift">
              <span className="shrink-0 w-11 h-11 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-xl">
                🇰🇭
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-emerald-800">
                  {t("checkout.payWith")}
                </p>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {t("checkout.payWithHint")}
                </p>
                {payment?.display_name && (
                  <p className="mt-2 text-xs text-slate-500">
                    {t("pay.receiver")}:{" "}
                    <span className="font-semibold text-slate-700">
                      {payment.display_name}
                    </span>
                    {payment.bakong_id ? (
                      <>
                        {" · "}
                        {t("pay.receiverId")}:{" "}
                        <span className="font-semibold text-slate-700">
                          {payment.bakong_id}
                        </span>
                      </>
                    ) : null}
                  </p>
                )}
                {payment && payment.enabled === false && (
                  <p className="mt-2 text-xs font-medium text-amber-700">
                    ⚠️ Online payment is not configured yet — we will contact you
                    to arrange payment.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Summary ===== */}
        <div
          className="bg-white rounded-2xl border border-slate-200 p-6 h-fit lg:sticky lg:top-24 animate-fade-in-up transition-shadow duration-300 hover:shadow-soft"
          style={{ animationDelay: "120ms" }}
        >
          <h2 className="text-lg font-bold text-slate-900">
            {t("checkout.orderSummary")}
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between gap-2 text-slate-600">
                <span className="truncate">
                  {i.name} × {i.quantity}
                </span>
                <span className="font-medium text-slate-900 shrink-0">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-200 flex justify-between text-slate-600">
              <span>{t("cart.subtotal", { count: items.length })}</span>
              <span className="font-semibold text-slate-900">
                {formatPrice(subtotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{t("checkout.discount", { percent: promo.percent })}</span>
                <span className="font-semibold">−{formatPrice(discount)}</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-lg font-bold text-slate-900">
            <span>{t("cart.total")}</span>
            <span>{formatPrice(total)}</span>
          </div>

          {error && (
            <p className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 animate-fade-in">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={placeOrder}
            disabled={placing}
            className="mt-6 w-full px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition-all duration-200 hover:bg-emerald-700 hover:shadow-lift active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
          >
            {placing ? t("checkout.placing") : t("checkout.placeOrder")}
          </button>
          <Link
            to="/cart"
            className="mt-3 block w-full text-center px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
          >
            {t("checkout.backToCart")}
          </Link>
        </div>
      </div>
    </div>
  );
}
