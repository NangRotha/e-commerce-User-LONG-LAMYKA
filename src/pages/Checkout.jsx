import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import { isValidPhone } from "../lib/payment";
import { formatPrice, localizedName } from "../lib/helpers";

const CUSTOMER_KEY = "shop_customer";

// បញ្ជីខេត្ត-ក្រុងទាំង ១២ នៃប្រទេសកម្ពុជា (+ ជម្រើសខេត្តផ្សេងៗ)
export const CAMBODIA_PROVINCES = [
  { km: "រាជធានីភ្នំពេញ", en: "Phnom Penh" },
  { km: "ខេត្តកណ្តាល", en: "Kandal" },
  { km: "ខេត្តសៀមរាប", en: "Siem Reap" },
  { km: "ខេត្តបាត់ដំបង", en: "Battambang" },
  { km: "ខេត្តព្រះសីហនុ", en: "Preah Sihanouk" },
  { km: "ខេត្តកំពង់ចាម", en: "Kampong Cham" },
  { km: "ខេត្តកំពត", en: "Kampot" },
  { km: "ខេត្តកែប", en: "Kep" },
  { km: "ខេត្តតាកែវ", en: "Takeo" },
  { km: "ខេត្តកំពង់ធំ", en: "Kampong Thom" },
  { km: "ខេត្តកំពង់ឆ្នាំង", en: "Kampong Chhnang" },
  { km: "ខេត្តបន្ទាយមានជ័យ", en: "Banteay Meanchey" },
  { km: "ខេត្តផ្សេងៗ", en: "Other Provinces" },
];

/**
 * Checkout — Guest Checkout (គ្មាន Login / Sign Up) ✓
 * អតិថិជនបំពេញឈ្មោះ / លេខទូរស័ព្ទ / ជ្រើសរើសខេត្តទាំង ១២ / អាសយដ្ឋានលម្អិត រួចបញ្ជាទិញ
 * បន្ទាប់មកទៅទំព័រ Order Success ដើម្បីស្កេន KHQR បង់ប្រាក់ (auto-detect) ✓
 */
export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { t, lang } = useI18n();

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
          className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl clay-nav-active text-white font-bold text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-soft"
        >
          <span>🛍️</span>
          <span>{t("cart.continueShopping")}</span>
        </Link>
      </div>
    );
  }

  const input =
    "mt-1.5 w-full px-4 py-3 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-white/90 dark:bg-[#120e1a] text-slate-800 dark:text-purple-100 placeholder:text-purple-300 dark:placeholder:text-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200 text-sm sm:text-base font-semibold shadow-2xs";
  const label = "block text-xs sm:text-sm font-bold text-slate-800 dark:text-purple-200";
  const card =
    "clay-card p-5 sm:p-7 shadow-soft";

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-12 font-sans">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <span>🎀</span>
          <span>{t("checkout.title")}</span>
        </h1>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 px-3.5 py-1.5 rounded-full animate-pop-in shadow-2xs">
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
              <span className="text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                {t("checkout.nationwideDelivery")}
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
                    {CAMBODIA_PROVINCES.map((p) => {
                      const val = lang === "km" ? p.km : p.en;
                      return (
                        <option key={p.en} value={val}>
                          {val}
                        </option>
                      );
                    })}
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
                  className={input}
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
              className={input}
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
                className={`flex-1 px-4 py-2.5 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-white/90 dark:bg-[#120e1a] uppercase text-slate-800 dark:text-purple-100 placeholder:text-purple-300 dark:placeholder:text-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-60 transition duration-200 text-sm sm:text-base font-semibold shadow-2xs`}
              />
              {promoApplied ? (
                <button
                  type="button"
                  onClick={removePromo}
                  className="px-4 sm:px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-purple-900/50 text-slate-600 dark:text-purple-200 font-bold hover:bg-purple-50/50 dark:hover:bg-[#1f152b] transition-all duration-200 text-xs sm:text-sm active:scale-95 shrink-0"
                >
                  {t("checkout.remove")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyPromo}
                  className="clay-nav-active px-5 sm:px-6 py-2.5 rounded-2xl text-white font-bold shadow-soft transition-all duration-200 text-xs sm:text-sm hover:scale-[1.02] active:scale-95 shrink-0"
                >
                  {t("checkout.apply")}
                </button>
              )}
            </div>
            {promoApplied && promo && (
              <p className="mt-2.5 text-xs sm:text-sm text-purple-600 dark:text-purple-300 font-bold animate-pop-in">
                {t("checkout.applied", { percent: promo.percent })}
              </p>
            )}
            {promoError && (
              <p className="mt-2.5 text-xs sm:text-sm text-rose-600 font-bold animate-fade-in">
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
                <span className="text-[11px] sm:text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 animate-pop-in shadow-2xs">
                  {selectedPaymentMethod === "aba_pay" ? t("pay.autoKhqrTag") : t("pay.codTag")}
                </span>
              ) : province ? (
                <span className="text-[11px] sm:text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 animate-pop-in shadow-2xs">
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
                  className={`cursor-pointer flex items-start gap-3 rounded-2xl border-2 p-4 transition-all duration-200 ${
                    selectedPaymentMethod === "aba_pay"
                      ? "border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 shadow-soft ring-2 ring-purple-400/20"
                      : "border-slate-200/80 dark:border-purple-900/40 bg-white/70 dark:bg-[#120e1a]/70 hover:border-purple-300"
                  }`}
                >
                  <span className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-[#1f152b] border border-purple-100 dark:border-purple-900 flex items-center justify-center text-xl shadow-xs">
                    🇰🇭
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 dark:text-purple-100 text-sm sm:text-base">
                        {t("pay.autoKhqrTitle")}
                      </p>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === "aba_pay"
                          ? "border-purple-500 bg-purple-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {selectedPaymentMethod === "aba_pay" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {t("pay.autoKhqrHint")}
                    </p>
                    {payment?.display_name && (
                      <p className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-bold">
                        {t("pay.receivePayment")} {payment.display_name} {payment.bakong_id ? `(${payment.bakong_id})` : ""}
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
                  className={`cursor-pointer flex items-start gap-3 rounded-2xl border-2 p-4 transition-all duration-200 ${
                    selectedPaymentMethod === "cod"
                      ? "border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 shadow-soft ring-2 ring-purple-400/20"
                      : "border-slate-200/80 dark:border-purple-900/40 bg-white/70 dark:bg-[#120e1a]/70 hover:border-purple-300"
                  }`}
                >
                  <span className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-[#1f152b] border border-purple-100 dark:border-purple-900 flex items-center justify-center text-2xl shadow-xs">
                    💵
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 dark:text-purple-100 text-sm sm:text-base">
                        {t("checkout.codTitle")}
                      </p>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === "cod"
                          ? "border-purple-500 bg-purple-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {selectedPaymentMethod === "cod" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {t("checkout.codDesc")}
                    </p>
                  </div>
                </div>
              </div>
            ) : province ? (
              /* If Province -> Prepayment via ABA Pay / KHQR */
              <div className="mt-3.5 flex items-start gap-3 rounded-2xl border-2 border-purple-300 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/40 p-4 transition-all duration-300 shadow-soft">
                <span className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-[#1f152b] border border-purple-100 dark:border-purple-900 flex items-center justify-center text-xl shadow-xs">
                  🇰🇭
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-purple-950 dark:text-purple-200 text-sm sm:text-base">
                    {t("checkout.provincePrepayTitle")}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
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
              <div className="mt-3.5 flex items-center gap-3 rounded-2xl border border-dashed border-purple-200 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-950/20 p-4">
                <span className="text-2xl">📍</span>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {t("checkout.selectProvinceFirst")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===== Summary ===== */}
        <div
          className="clay-card p-5 sm:p-7 h-fit lg:sticky lg:top-24 animate-fade-in-up"
          style={{ animationDelay: "120ms" }}
        >
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t("checkout.orderSummary")}
          </h2>
          <div className="mt-3.5 sm:mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <div key={`${i.id}-${i.variant || ""}`} className="flex justify-between gap-2 text-slate-600 dark:text-slate-300">
                <div className="min-w-0">
                  <p className="truncate text-slate-800 dark:text-slate-100 font-bold text-sm sm:text-base">
                    {localizedName(i, lang)} × {i.quantity}
                  </p>
                  {i.variant && (
                    <span className="inline-block mt-0.5 text-xs text-purple-600 dark:text-purple-400 font-bold">
                      {i.variant}
                    </span>
                  )}
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white shrink-0">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </div>
            ))}
            <div className="pt-3 border-t border-purple-100 dark:border-purple-900/40 flex justify-between text-slate-600 dark:text-slate-400 text-sm font-semibold">
              <span>{t("cart.subtotal", { count: items.length })}</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatPrice(subtotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-purple-600 dark:text-purple-400 text-sm font-bold">
                <span>{t("checkout.discount", { percent: promo.percent })}</span>
                <span className="font-extrabold">−{formatPrice(discount)}</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-900/40 flex justify-between text-base sm:text-lg font-black text-slate-900 dark:text-white">
            <span>{t("cart.total")}</span>
            <span className="text-purple-600 dark:text-purple-400">{formatPrice(total)}</span>
          </div>

          {error && (
            <p className="mt-4 text-xs sm:text-sm text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl px-4 py-3 font-semibold animate-fade-in">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={placeOrder}
            disabled={placing}
            className="mt-5 sm:mt-6 w-full py-4 rounded-2xl clay-nav-active text-white font-black text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-soft flex items-center justify-center gap-2"
          >
            <span>{placing ? "⏳" : "🛍️"}</span>
            <span>{placing ? t("checkout.placing") : t("checkout.placeOrder")}</span>
            <span>✨</span>
          </button>
          <Link
            to="/cart"
            className="clay-circle-btn !w-full !h-auto py-3.5 !rounded-2xl text-slate-700 dark:text-purple-200 font-bold text-sm block text-center mt-3 shadow-2xs"
          >
            ← {t("checkout.backToCart")}
          </Link>
        </div>
      </div>
    </div>
  );
}
