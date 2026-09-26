import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import { formatMoney } from "../lib/payment";
import { useRealtime } from "../context/RealtimeContext";
import { CheckCircle3D } from "../components/ClayIcons";

// ពិនិត្យស្ថានភាពការបង់ប្រាក់រៀងរាល់ 3 វិនាទី (auto-detect payment)
const POLL_MS = 3000;
// តាមឯកសារ KHQRcc ៖ Poll រៀងរាល់ 3 វិនាទី មិនលើស 3 នាទី (បន្ទាប់មក QR ផុតកំណត់)
const MAX_POLL_MS = 3 * 60 * 1000;

// KHQRcc Checkout Plugin — បង្ហាញ ABA Pay Checkout (KHQR + Deeplink) ជា Modal
const KHQR_PLUGIN_SRC = "https://anajakpay.com/khqrcc-plugin.js";

/** ផ្ទុក Script របស់ KHQRcc Plugin (តែពេលចាំបាច់) */
function loadKhqrPlugin() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.KhqrPayway) return resolve(window.KhqrPayway);

    const script = document.getElementById("khqrcc-plugin") || document.createElement("script");
    script.id = "khqrcc-plugin";
    script.src = KHQR_PLUGIN_SRC;
    script.async = true;
    script.onload = () =>
      window.KhqrPayway ? resolve(window.KhqrPayway) : reject(new Error("plugin unavailable"));
    script.onerror = () => reject(new Error("plugin failed to load"));
    if (!script.parentNode) document.head.appendChild(script);
  });
}

/**
 * Order Success — ស្កេន KHQR បង់ប្រាក់ (ABA / Bakong Wallet)
 *
 * ✅ Auto payment: ទំព័រនេះ Poll ស្ថានភាពទៅ KHQRcc Gateway រៀងរាល់ 3 វិនាទី
 *    ពេលអតិថិជនស្កេន និងបង់ប្រាក់រួច -> Order ត្រូវបានបញ្ជាក់ថា "paid" ដោយស្វ័យប្រវត្តិ
 * ✅ Real-time: បើ Admin ប្តូរស្ថានភាព -> ទំព័រនេះដឹងភ្លាមៗតាម WebSocket (orders_changed)
 * ✅ Refresh-safe: QR ត្រូវបានរក្សាទុកក្នុង Database -> Refresh ក៏នៅតែឃើញ QR
 */
export default function OrderSuccess() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();

  const [order, setOrder] = useState(location.state?.order || null);
  const [paymentStatus, setPaymentStatus] = useState(
    location.state?.order?.status || "pending"
  );
  const [confirming, setConfirming] = useState(false);
  const [pollError, setPollError] = useState("");
  const [opening, setOpening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(false);
  const [pollKey, setPollKey] = useState(0);
  const timerRef = useRef(null);
  const startedRef = useRef(Date.now());

  const orderId = order?.order_id || searchParams.get("order_id");

  // ទាញព័ត៌មាន Order ឡើងវិញ (រួមទាំង QR + ព័ត៌មាន Bakong) — ប្រើពេល Refresh ឬពេលមានព្រឹត្តិការណ៍ real-time
  const refresh = useCallback(async () => {
    if (!orderId) return;
    try {
      const s = await api.getOrderStatus(orderId);
      setOrder((prev) => ({ ...(prev || {}), ...s }));
      setPaymentStatus(s.status);
    } catch {
      /* ignore — បន្តបង្ហាញទិន្នន័យចាស់ */
    }
  }, [orderId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Real-time: Admin ប្តូរស្ថានភាព Order -> ទំព័រនេះបច្ចុប្បន្នភាពភ្លាមៗ
  useRealtime("orders_changed", refresh);

  /**
   * Gateway Redirect (success_url) ផ្ញើ `success_hash`, `success_amount`,
   * `success_time` មកជាមួយ URL -> យើងផ្ទៀងផ្ទាត់ជាមួយ Gateway ភ្លាមៗ
   * (Server-side verify — មិនជឿតែលើ Query Param) ដើម្បីកុំរង់ចាំ Poll
   */
  const successHash = searchParams.get("success_hash");
  useEffect(() => {
    if (!successHash) return;
    let cancelled = false;

    (async () => {
      try {
        setConfirming(true);
        let tx = order?.payment_transaction_id;
        if (!tx) {
          const s = await api.getOrderStatus(orderId);
          tx = s.payment_transaction_id;
          if (!cancelled) setOrder((prev) => ({ ...(prev || {}), ...s }));
        }
        if (tx && !cancelled) {
          const confirmed = await api.confirmPayment(tx);
          setPaymentStatus(confirmed.status || "paid");
        }
      } catch {
        /* បើបរាជ័យ -> Poll / WebSocket នឹងដោះស្រាយ */
      } finally {
        if (!cancelled) setConfirming(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successHash, orderId]);

  // Auto-detect: Poll KHQRcc រហូតដល់ឃើញ success -> Confirm -> Order paid (skip if COD)
  useEffect(() => {
    const isCodOrder =
      order?.payment_method === "cod" ||
      (order?.shipping_address &&
        (order.shipping_address.toLowerCase().includes("ភ្នំពេញ") ||
          order.shipping_address.toLowerCase().includes("phnom penh")));
    const tx = order?.payment_transaction_id;
    if (isCodOrder || !tx || paymentStatus === "paid") return;

    let stopped = false;

    const poll = async () => {
      // តាមឯកសារ KHQRcc៖ បើហួស 3 នាទី -> ឈប់ Poll (QR ផុតកំណត់)
      if (Date.now() - startedRef.current > MAX_POLL_MS) {
        clearInterval(timerRef.current);
        setExpired(true);
        return;
      }
      try {
        const s = await api.checkPaymentStatus(tx);
        if (stopped) return;
        if (s.status === "success") {
          clearInterval(timerRef.current);
          setConfirming(true);
          try {
            const confirmed = await api.confirmPayment(tx);
            setPaymentStatus(confirmed.status || "paid");
          } catch {
            /* WS / refresh នឹងធ្វើបច្ចុប្បន្នភាពជំនួស */
          } finally {
            setConfirming(false);
          }
        } else if (s.status === "failed") {
          clearInterval(timerRef.current);
          setPollError(t("pay.failed"));
        }
      } catch {
        /* network error — បន្តពិនិត្យបន្ទាប់ */
      }
    };

    poll();
    timerRef.current = setInterval(poll, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timerRef.current);
    };
  }, [order?.payment_transaction_id, order?.payment_method, order?.shipping_address, paymentStatus, pollKey, t]);

  /** បើក ABA Pay Checkout — ប្រើ KHQRcc Plugin Modal (បើផ្ទុកមិនបាន -> បើក Tab ថ្មី) */
  const payNow = async () => {
    const url = order?.payment_url;
    if (!url) return;
    setOpening(true);
    try {
      const KhqrPayway = await loadKhqrPlugin();
      KhqrPayway.openCheckout({
        checkout_url: url,
        onSuccess: () => {
          setPaymentStatus("paid");
          refresh();
        },
        onError: () => {
          /* អ្នកប្រើបិទ Modal — មិនធ្វើអ្វី */
        },
      });
    } catch {
      // Plugin ផ្ទុកមិនបាន (Network / Ad-blocker) -> បើក Checkout ដោយផ្ទាល់
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setOpening(false);
    }
  };

  /** ពិនិត្យការបង់ប្រាក់ម្តងទៀត (ពេល QR ហួស 3 នាទី) */
  const checkNow = () => {
    setExpired(false);
    setPollError("");
    startedRef.current = Date.now();
    setPollKey((k) => k + 1);
    refresh();
  };

  const copyLink = async () => {
    const url = order?.payment_url || order?.payment_checkout_url;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(t("pay.copyLink"), url);
    }
  };

  if (!orderId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-800">{t("pay.noOrder")}</h1>
        <Link
          to="/"
          className="mt-4 inline-block text-pink-600 dark:text-pink-400 font-semibold hover:underline"
        >
          {t("pay.backToShop")}
        </Link>
      </div>
    );
  }

  const isCod =
    order?.payment_method === "cod" ||
    (order?.shipping_address &&
      (order.shipping_address.toLowerCase().includes("ភ្នំពេញ") ||
        order.shipping_address.toLowerCase().includes("phnom penh")));
  const isPaid = paymentStatus === "paid";
  const showQr =
    !isCod && order?.payment_enabled && order?.payment_qr_url && !isPaid;
  const currency = order?.currency || "USD";
  const khrRate = order?.khr_rate || 4100;
  const amount = formatMoney(order?.total_amount ?? 0, currency, khrRate);
  // Link សម្រាប់បើកក្នុង Tab ថ្មី -> ប្រើ Checkout ផ្ទាល់ (លឿនជាងមួយជំហាត់)
  const directCheckoutUrl = order?.payment_checkout_url || order?.payment_url || "";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 sm:pb-12">
      <div className="clay-card !rounded-[32px] p-6 sm:p-10 text-center animate-fade-in-up">
        {/* Company name (ពី Admin Settings — Bakong Wallet) */}
        {order?.payment_company_name && (
          <p className="text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
            ✨ {order.payment_company_name} ✨
          </p>
        )}

        {/* Status icon with 3D aesthetic */}
        <div className="mx-auto mt-4 w-20 h-20 flex items-center justify-center">
          {isPaid ? (
            <CheckCircle3D className="w-18 h-18 animate-pop-in drop-shadow-md" />
          ) : isCod ? (
            <span className="w-20 h-20 rounded-3xl clay-card flex items-center justify-center text-4xl shadow-soft">
              🚚
            </span>
          ) : (
            <span className="w-20 h-20 rounded-3xl clay-card-purple flex items-center justify-center text-4xl shadow-soft animate-pulse">
              ⏳
            </span>
          )}
        </div>

        <h1 className="mt-5 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {isPaid
            ? "🎉 " + t("pay.paidTitle")
            : isCod
            ? "🚚 " + t("pay.codOrderTitle")
            : showQr
            ? "📱 " + t("pay.scanTitle")
            : "✨ " + t("pay.orderPlacedTitle")}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-purple-600/90 dark:text-purple-300 font-bold">
          {isPaid
            ? t("pay.paidHint")
            : isCod
            ? t("pay.codOrderHint")
            : showQr
            ? t("pay.scanHint")
            : t("pay.orderPlacedHint")}
        </p>

        {/* Order details */}
        <div className="mt-8 clay-card p-6 text-left space-y-3 !rounded-2xl">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">{t("pay.orderId")}</span>
            <span className="font-extrabold text-slate-900 dark:text-white">#{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">{t("pay.status")}</span>
            <span
              className={`font-extrabold inline-flex items-center gap-1.5 transition-colors duration-300 ${
                isPaid || isCod
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPaid || isCod ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                }`}
              />
              {isPaid
                ? t("pay.statusPaid")
                : isCod
                ? t("pay.codStatus")
                : t("pay.statusPending")}
            </span>
          </div>
          {order?.shipping_company && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">
                {t("checkout.shippingCompany") ? t("checkout.shippingCompany").replace(" *", "") : "Shipping"}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                🚚 {order.shipping_company}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm pt-2 border-t border-purple-100 dark:border-purple-900/40">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">{t("pay.total")}</span>
            <span className="font-black text-purple-600 dark:text-purple-400 text-lg">{amount}</span>
          </div>
        </div>

        {/* ===== Phnom Penh Cash on Delivery (COD) Card ===== */}
        {isCod && (
          <div className="mt-6 clay-card-yellow p-5 text-left rounded-2xl shadow-soft animate-fade-in-up">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                💵
              </span>
              <div>
                <h3 className="font-black text-amber-950 dark:text-amber-100 text-base">
                  {t("pay.codBadge")}
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-200 font-bold">
                  {t("pay.codNoPrepay")}
                </p>
              </div>
            </div>

            <div className="mt-3.5 pt-3.5 border-t border-amber-200/60 dark:border-amber-900/60 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              {order?.customer_phone && (
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  📞 {t("pay.codDriverNote")} ({order.customer_phone})
                </p>
              )}
              {order?.shipping_address && (
                <p className="text-slate-600 dark:text-slate-300">
                  {t("pay.shippingAddress")}{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-100">{order.shipping_address}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===== QR Code — Scan & Pay (ABA / Bakong Wallet) ===== */}
        {showQr && (
          <div
            className="mt-8 clay-card p-6 sm:p-8 rounded-[28px] animate-fade-in-up shadow-soft"
            style={{ animationDelay: "80ms" }}
          >
            <div className="relative mx-auto w-56 h-56 sm:w-60 sm:h-60 bg-white rounded-3xl border-2 border-purple-200/80 dark:border-purple-800 shadow-soft p-3.5 flex items-center justify-center">
              {/* Animated scanning line (បង្ហាញថាកំពុងរង់ចាំការស្កេន) */}
              {!isPaid && (
                <span className="pointer-events-none absolute inset-0 rounded-3xl qr-scan-line" />
              )}
              <img
                src={order.payment_qr_url}
                alt={t("pay.qrAlt")}
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>

            <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white tracking-tight">{amount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{t("pay.amountToPay")}</p>

            {/* ព័ត៌មានអ្នកទទួលប្រាក់ (Display Name + Bakong Wallet ID) */}
            {(order.payment_display_name || order.payment_bakong_id) && (
              <div className="mt-4 grid sm:grid-cols-2 gap-2.5 text-left">
                {order.payment_display_name && (
                  <div className="rounded-2xl bg-purple-50/60 dark:bg-[#1f152b] border border-purple-100 dark:border-purple-900/60 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-purple-500 dark:text-purple-400 font-bold">
                      {t("pay.receiver")}
                    </p>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-purple-100 truncate">
                      {order.payment_display_name}
                    </p>
                  </div>
                )}
                {order.payment_bakong_id && (
                  <div className="rounded-2xl bg-purple-50/60 dark:bg-[#1f152b] border border-purple-100 dark:border-purple-900/60 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-purple-500 dark:text-purple-400 font-bold">
                      {t("pay.receiverId")}
                    </p>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-purple-100 truncate">
                      {order.payment_bakong_id}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              {directCheckoutUrl && (
                <a
                  href={directCheckoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl clay-nav-active text-white font-bold text-sm shadow-soft transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <span>📲 {t("pay.openCheckout")}</span>
                </a>
              )}
              <button
                type="button"
                onClick={copyLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl clay-circle-btn !w-auto !h-auto text-slate-700 dark:text-purple-200 text-sm font-bold shadow-2xs transition-all duration-200 active:scale-95"
              >
                {copied ? t("pay.copied") : t("pay.copyLink")}
              </button>
            </div>
          </div>
        )}

        {/* ===== គ្មានរូប QR ពី Gateway -> បង្ហាញ Managed Checkout (ABA Pay) ===== */}
        {!showQr && !isCod && order?.payment_enabled && order?.payment_url && !isPaid && (
          <div className="mt-8 clay-card p-6 rounded-[28px] shadow-soft animate-fade-in-up">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-2xl shadow-soft">
              🇰🇭
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{amount}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">{t("pay.checkoutHint")}</p>

            <button
              type="button"
              onClick={payNow}
              disabled={opening}
              className="mt-5 w-full sm:w-auto px-8 py-3.5 rounded-2xl clay-nav-active text-white font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60 shadow-soft"
            >
              {opening ? t("common.loading") : `💳 ${t("pay.payNow")}`}
            </button>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <a
                href={directCheckoutUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                {t("pay.openCheckout")}
              </a>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={copyLink}
                className="font-medium text-slate-500 dark:text-slate-400 hover:text-purple-600 transition-colors"
              >
                {copied ? t("pay.copied") : t("pay.copyLink")}
              </button>
            </div>
          </div>
        )}

        {/* ===== Waiting / verifying (ទាំង QR និង Checkout) ===== */}
        {!isPaid && !isCod && order?.payment_enabled && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
              {confirming ? (
                <>
                  <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  {t("pay.verifying")}
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                  {t("pay.waiting")}
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{t("pay.scanNote")}</p>

            {expired && (
              <div className="mt-2 flex flex-col items-center gap-2">
                <p className="text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3 font-bold">
                  ⏰ {t("pay.expired")}
                </p>
                <button
                  type="button"
                  onClick={checkNow}
                  className="px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
                >
                  {t("pay.checkNow")}
                </button>
              </div>
            )}
            {pollError && (
              <p className="mt-1 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl px-4 py-3 font-semibold animate-fade-in">
                {pollError}
              </p>
            )}
          </div>
        )}

        {/* ===== Paid confirmation ===== */}
        {isPaid && (
          <div className="mt-8 clay-card-mint p-6 rounded-3xl shadow-soft animate-pop-in">
            <p className="text-lg font-black text-emerald-800 dark:text-emerald-200">
              ✓ {t("pay.paidBadge")}
            </p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300 font-semibold">{t("pay.paidNote")}</p>
            {order?.customer_email ? (
              <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 font-bold">
                {t("pay.receiptSent")}{" "}
                <span>({order.customer_email})</span>
              </p>
            ) : null}
          </div>
        )}

        {/* Fallback payment link (when ABA Pay is not configured) */}
        {!isCod && !order?.payment_enabled && order?.payment_url && !isPaid && (
          <div className="mt-8 flex flex-col items-center gap-2 text-sm">
            <span className="text-slate-500">{t("pay.payLink")}</span>
            <a
              href={order.payment_url}
              target="_blank"
              rel="noreferrer"
              className="text-purple-600 font-semibold hover:underline break-all max-w-full"
            >
              {order.payment_url}
            </a>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-8 py-3.5 rounded-2xl clay-nav-active text-white font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-soft text-sm inline-flex items-center justify-center gap-2"
          >
            <span>←</span>
            <span>{t("pay.backToShop")}</span>
          </Link>
        </div>

        {!isCod && <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 font-semibold">🔒 {t("pay.secureNote")}</p>}
      </div>
    </div>
  );
}
