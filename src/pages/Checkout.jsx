import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import { isValidPhone } from "../lib/payment";
import { formatPrice } from "../lib/helpers";

const CUSTOMER_KEY = "shop_customer";

// បញ្ជីខេត្ត-ក្រុងទាំង ១២ នៃប្រទេសកម្ពុជា (+ ជម្រើសខេត្តផ្សេងៗ)
export const CAMBODIA_PROVINCES = [
  "ភ្នំពេញ (Phnom Penh)",
  "កណ្តាល (Kandal)",
  "សៀមរាប (Siem Reap)",
  "បាត់ដំបង (Battambang)",
  "ព្រះសីហនុ (Preah Sihanouk)",
  "កំពង់ចាម (Kampong Cham)",
  "កំពត (Kampot)",
  "កែប (Kep)",
  "តាកែវ (Takeo)",
  "កំពង់ធំ (Kampong Thom)",
  "កំពង់ឆ្នាំង (Kampong Chhnang)",
  "បន្ទាយមានជ័យ (Banteay Meanchey)",
  "ខេត្តផ្សេងៗ (Other Provinces)",
];

/**
 * Checkout — Guest Checkout (គ្មាន Login / Sign Up) ✓
 * អតិថិជនបំពេញឈ្មោះ / លេខទូរស័ព្ទ / ជ្រើសរើសខេត្តទាំង ១២ / អាសយដ្ឋានលម្អិត រួចបញ្ជាទិញ
 * បន្ទាប់មកទៅទំព័រ Order Success ដើម្បីស្កេន KHQR បង់ប្រាក់ (auto-detect) ✓
 */
export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState(null); // { percent }
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [payment, setPayment] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("aba_pay");

  const isPhnomPenh =
    (province || "").toLowerCase().includes("ភ្នំពេញ") ||
    (province || "").toLowerCase().includes("phnom penh");

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
      if (saved.province) setProvince(saved.province);
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
    if (!province.trim()) return setError(t("checkout.errProvince"));
    if (!address.trim()) return setError(t("checkout.errAddress"));

    setPlacing(true);
    try {
      const shippingAddress = `${province} — ${address.trim()}`;
      const paymentMethod = isPhnomPenh ? selectedPaymentMethod : "aba_pay";

      const res = await api.checkout({
        items: items.map((i) => ({
          product_id: i.id,
          quantity: i.quantity,
          variant: i.variant || null,
        })),
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        shipping_address: shippingAddress,
        note: note.trim(),
        promo_code: promo ? promoCode.trim() : null,
        payment_method: paymentMethod,
      });
      try {
        localStorage.setItem(
          CUSTOMER_KEY,
          JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            province: province.trim(),
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center animate-fade-in-up">
        <div className="text-5xl sm:text-6xl mb-4">🛒</div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
          {t("checkout.nothingToCheckout")}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
          {t("checkout.emptyHint")}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold transition-all duration-200 hover:from-pink-600 hover:to-rose-600 hover:shadow-lift active:scale-95 shadow-md shadow-pink-500/25"
        >
          {t("cart.continueShopping")}
        </Link>
      </div>
    );
  }

  const input =
    "mt-1.5 w-full px-4 py-3 rounded-2xl border border-pink-200/80 dark:border-pink-900/50 bg-pink-50/30 dark:bg-[#130D18]/80 text-slate-900 dark:text-pink-100 placeholder:text-pink-300 dark:placeholder:text-pink-400/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white dark:focus:bg-[#1A1220] transition duration-200 text-sm sm:text-base font-semibold shadow-xs";
  const label = "block text-xs sm:text-sm font-black text-slate-800 dark:text-pink-200";
  const card =
    "bg-white/95 dark:bg-[#1A1220]/95 rounded-3xl border border-pink-100/90 dark:border-pink-950/60 p-5 sm:p-7 shadow-marshmallow transition-all duration-300 hover:shadow-cute-glow";

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-12">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-pink-100 flex items-center gap-2">
          <span>🎀</span>
          <span>{t("checkout.title")}</span>
        </h1>
        <span className="inline-flex items-center gap-1.5 text-xs font-black text-pink-600 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-900 px-3.5 py-1.5 rounded-full animate-pop-in shadow-xs">
          <span>✨</span>
          <span>{t("checkout.guestBadge")}</span>
        </span>
      </div>

      <div className="mt-5 sm:mt-8 grid lg:grid-cols-3 gap-5 sm:gap-8">
        {/* ===== Form ===== */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* 1. Contact Information */}
          <div className={`${card} animate-fade-in-up`}>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t("checkout.contact")}
            </h2>
            <div className="mt-3.5 sm:mt-4 grid sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className={label}>{t("checkout.fullName")}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("checkout.fullNamePlaceholder")}
                  className={input}
                  autoComplete="name"
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
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address (with 12 Cambodian Provinces dropdown) */}
          <div
            className={`${card} animate-fade-in-up`}
            style={{ animationDelay: "80ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t("checkout.delivery")}
              </h2>
              <span className="text-[11px] sm:text-xs font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-pink-100 dark:border-pink-900">
                🇰🇭 ដឹកជញ្ជូនទូទាំងប្រទេស
              </span>
            </div>

            <div className="mt-3.5 sm:mt-4 space-y-3.5 sm:space-y-4">
              {/* ខេត្តទាំង12 ដែលមាន select */}
              <div>
                <label className={label}>{t("checkout.province")}</label>
                <div className="relative mt-1.5">
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className={`${input} appearance-none pr-10 cursor-pointer font-medium text-slate-800 dark:text-slate-100`}
                  >
                    <option value="" disabled>
                      {t("checkout.selectProvince")}
                    </option>
                    {CAMBODIA_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* អាសយដ្ឋានលម្អិត */}
              <div>
                <label className={label}>{t("checkout.detailAddress")}</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder={t("checkout.detailAddressPlaceholder")}
                  className="mt-1.5 w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-pink-100 dark:border-pink-950/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-300 transition duration-200 text-sm sm:text-base"
                />
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {t("checkout.addressHint")}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Note */}
          <div
            className={`${card} animate-fade-in-up`}
            style={{ animationDelay: "140ms" }}
          >
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t("checkout.note")}{" "}
              <span className="text-xs sm:text-sm font-normal text-slate-400">
                {t("common.optional")}
              </span>
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={t("checkout.notePlaceholder")}
              className="mt-3 w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-pink-100 dark:border-pink-950/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-300 transition duration-200 text-sm sm:text-base"
            />
          </div>

          {/* 4. Promo Code */}
          <div
            className={`${card} animate-fade-in-up`}
            style={{ animationDelay: "200ms" }}
          >
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t("checkout.promo")}{" "}
              <span className="text-xs sm:text-sm font-normal text-slate-400">
                {t("common.optional")}
              </span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t("checkout.promoHint")}</p>
            <div className="mt-3.5 flex gap-2 sm:gap-3">
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder={t("checkout.promoPlaceholder")}
                disabled={promoApplied}
                className={`flex-1 px-3.5 sm:px-4 py-2.5 rounded-xl border border-pink-100 dark:border-pink-950/80 bg-white dark:bg-slate-800 uppercase text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-60 transition duration-200 text-sm sm:text-base`}
              />
              {promoApplied ? (
                <button
                  type="button"
                  onClick={removePromo}
                  className="px-3.5 sm:px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-pink-50/50 dark:hover:bg-slate-800 transition-all duration-200 text-xs sm:text-sm active:scale-95 shrink-0"
                >
                  {t("checkout.remove")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyPromo}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-md shadow-pink-500/25 transition-all duration-200 text-xs sm:text-sm active:scale-95 shrink-0"
                >
                  {t("checkout.apply")}
                </button>
              )}
            </div>
            {promoApplied && promo && (
              <p className="mt-2.5 text-xs sm:text-sm text-pink-600 dark:text-pink-400 font-medium animate-pop-in">
                {t("checkout.applied", { percent: promo.percent })}
              </p>
            )}
            {promoError && (
              <p className="mt-2.5 text-xs sm:text-sm text-rose-600 animate-fade-in">
                {promoError}
              </p>
            )}
          </div>

          {/* 5. Payment */}
          <div
            className={`${card} animate-fade-in-up`}
            style={{ animationDelay: "260ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t("checkout.payment")}
              </h2>
              {isPhnomPenh ? (
                <span className="text-[11px] sm:text-xs font-bold text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/70 px-2.5 py-1 rounded-full border border-pink-200 dark:border-pink-800 animate-pop-in">
                  {selectedPaymentMethod === "aba_pay" ? "⚡ Auto Pay KHQR" : "🚚 Cash on Delivery"}
                </span>
              ) : province ? (
                <span className="text-[11px] sm:text-xs font-bold text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/70 px-2.5 py-1 rounded-full border border-pink-200 dark:border-pink-800 animate-pop-in">
                  {t("checkout.provincePrepayBadge")}
                </span>
              ) : null}
            </div>

            {/* If Phnom Penh -> User can choose between ABA Pay / KHQR and COD */}
            {isPhnomPenh ? (
              <div className="mt-3.5 space-y-3">
                {/* Option 1: ABA Pay / KHQR */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPaymentMethod("aba_pay")}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedPaymentMethod("aba_pay")}
                  className={`cursor-pointer flex items-start gap-3 rounded-2xl border-2 p-3.5 sm:p-4 transition-all duration-200 ${
                    selectedPaymentMethod === "aba_pay"
                      ? "border-pink-500 bg-pink-50/80 dark:bg-pink-950/50 shadow-cute-glow"
                      : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-850/50 hover:border-pink-300"
                  }`}
                >
                  <span className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-pink-900 flex items-center justify-center text-xl shadow-xs">
                    🇰🇭
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 dark:text-pink-100 text-sm sm:text-base">
                        ABA Pay / Bakong KHQR (ស្កេនទូទាត់ភ្លាមៗ)
                      </p>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === "aba_pay"
                          ? "border-pink-500 bg-pink-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {selectedPaymentMethod === "aba_pay" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      ស្កេន QR តាមរយៈ ABA Mobile ឬកម្មវិធី Bakong ណាមួយ — ប្រព័ន្ធនឹងបញ្ជាក់ការបង់ប្រាក់ដោយស្វ័យប្រវត្តិ (Auto Confirm)
                    </p>
                    {payment?.display_name && (
                      <p className="mt-2 text-xs text-pink-600 dark:text-pink-400 font-medium">
                        ✨ ទទួលប្រាក់៖ {payment.display_name} {payment.bakong_id ? `(${payment.bakong_id})` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Option 2: Cash on Delivery (COD) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPaymentMethod("cod")}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedPaymentMethod("cod")}
                  className={`cursor-pointer flex items-start gap-3 rounded-2xl border-2 p-3.5 sm:p-4 transition-all duration-200 ${
                    selectedPaymentMethod === "cod"
                      ? "border-rose-400 bg-rose-50/80 dark:bg-rose-950/50 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-850/50 hover:border-rose-300"
                  }`}
                >
                  <span className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-2xl shadow-xs">
                    💵
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 dark:text-rose-100 text-sm sm:text-base">
                        {t("checkout.codTitle")}
                      </p>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === "cod"
                          ? "border-rose-500 bg-rose-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {selectedPaymentMethod === "cod" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t("checkout.codDesc")}
                    </p>
                  </div>
                </div>
              </div>
            ) : province ? (
              /* If Province -> Prepayment via ABA Pay / KHQR */
              <div className="mt-3.5 flex items-start gap-3 rounded-2xl border-2 border-pink-400/80 dark:border-pink-500 bg-pink-50/60 dark:bg-pink-950/40 p-3.5 sm:p-4 transition-all duration-300 shadow-cute-glow">
                <span className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-pink-900 flex items-center justify-center text-xl shadow-xs">
                  🇰🇭
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-pink-950 dark:text-pink-200 text-sm sm:text-base">
                    {t("checkout.provincePrepayTitle")}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {t("checkout.provincePrepayDesc")}
                  </p>
                  {payment?.display_name && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {t("pay.receiver")}:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {payment.display_name}
                      </span>
                      {payment.bakong_id ? (
                        <>
                          {" · "}
                          {t("pay.receiverId")}:{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {payment.bakong_id}
                          </span>
                        </>
                      ) : null}
                    </p>
                  )}
                  {payment && payment.enabled === false && (
                    <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                      {t("checkout.onlineNotConfigured")}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* If no province selected yet -> guide user */
              <div className="mt-3.5 flex items-center gap-3 rounded-xl border border-dashed border-pink-200 dark:border-pink-900 bg-pink-50/30 dark:bg-slate-800/40 p-4">
                <span className="text-2xl">📍</span>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {t("checkout.selectProvinceFirst")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===== Summary ===== */}
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-pink-100/80 dark:border-pink-950/60 p-4 sm:p-6 h-fit lg:sticky lg:top-24 animate-fade-in-up transition-shadow duration-300 hover:shadow-soft"
          style={{ animationDelay: "120ms" }}
        >
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t("checkout.orderSummary")}
          </h2>
          <div className="mt-3.5 sm:mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <div key={`${i.id}-${i.variant || ""}`} className="flex justify-between gap-2 text-slate-600 dark:text-slate-300">
                <div className="min-w-0">
                  <p className="truncate text-slate-800 dark:text-slate-100 font-medium text-sm sm:text-base">
                    {i.name} × {i.quantity}
                  </p>
                  {i.variant && (
                    <span className="inline-block mt-0.5 text-xs text-pink-600 dark:text-pink-400 font-semibold">
                      {i.variant}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-slate-600 dark:text-slate-400 text-sm">
              <span>{t("cart.subtotal", { count: items.length })}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatPrice(subtotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-pink-600 dark:text-pink-400 text-sm">
                <span>{t("checkout.discount", { percent: promo.percent })}</span>
                <span className="font-semibold">−{formatPrice(discount)}</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            <span>{t("cart.total")}</span>
            <span className="text-pink-600 dark:text-pink-400">{formatPrice(total)}</span>
          </div>

          {error && (
            <p className="mt-4 text-xs sm:text-sm text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl px-3.5 py-2.5 animate-fade-in">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={placeOrder}
            disabled={placing}
            className="mt-5 sm:mt-6 w-full px-7 py-4 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-black text-sm sm:text-base transition-all duration-200 hover:scale-102 hover:shadow-cute-glow active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 shadow-cute-glow flex items-center justify-center gap-2"
          >
            <span>{placing ? "⏳" : "💖"}</span>
            <span>{placing ? t("checkout.placing") : t("checkout.placeOrder")}</span>
            <span>✨</span>
          </button>
          <Link
            to="/cart"
            className="mt-3 block w-full text-center px-6 py-3 rounded-full border border-pink-200 dark:border-pink-900/60 text-slate-700 dark:text-pink-200 font-bold transition-all duration-200 hover:bg-pink-50/60 dark:hover:bg-pink-950/40 text-sm active:scale-[0.98]"
          >
            🌸 {t("checkout.backToCart")}
          </Link>
        </div>
      </div>
    </div>
  );
}
