import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { formatPrice } from "../lib/helpers";

// ពិនិត្យស្ថានភាពការបង់ប្រាក់រៀងរាល់ 3 វិនាទី (auto-detect payment)
const POLL_MS = 3000;

export default function OrderSuccess() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const order = location.state?.order;

  const [paymentStatus, setPaymentStatus] = useState(order?.status || "pending");
  const [confirming, setConfirming] = useState(false);
  const [pollError, setPollError] = useState("");
  const timerRef = useRef(null);

  // បើ Refresh page (state បាត់) -> យក Order ID ពី URL មកពិនិត្យស្ថានភាព
  const orderId = order?.order_id || searchParams.get("order_id");

  useEffect(() => {
    if (orderId && !order) {
      api
        .getOrderStatus(orderId)
        .then((s) => setPaymentStatus(s.status))
        .catch(() => {});
    }
  }, [orderId, order]);

  // Auto-detect: Poll KHQRcc រហូតដល់ឃើញ success -> Confirm -> Order paid
  useEffect(() => {
    const tx = order?.payment_transaction_id;
    if (!tx || paymentStatus === "paid") return;

    const poll = async () => {
      try {
        const s = await api.checkPaymentStatus(tx);
        if (s.status === "success") {
          clearInterval(timerRef.current);
          setConfirming(true);
          try {
            const confirmed = await api.confirmPayment(tx);
            setPaymentStatus(confirmed.status);
          } finally {
            setConfirming(false);
          }
        } else if (s.status === "failed") {
          clearInterval(timerRef.current);
          setPollError("Payment was not completed. Please try again.");
        }
      } catch {
        /* network error — បន្តពិនិត្យបន្ទាប់ */
      }
    };

    poll();
    timerRef.current = setInterval(poll, POLL_MS);
    return () => clearInterval(timerRef.current);
  }, [order?.payment_transaction_id, paymentStatus]);

  if (!order && !orderId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">No order found</h1>
        <Link
          to="/"
          className="mt-4 inline-block text-emerald-600 font-medium"
        >
          ← Back to shop
        </Link>
      </div>
    );
  }

  const isPaid = paymentStatus === "paid";
  const showQr =
    order?.payment_enabled && order.payment_qr_url && !isPaid;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
        <div
          className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
            isPaid
              ? "bg-emerald-100 animate-pop-in"
              : "bg-amber-100 animate-pulse"
          }`}
        >
          {isPaid ? "✅" : "⏳"}
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900">
          {isPaid
            ? "Payment received!"
            : showQr
            ? "Scan to pay with ABA / Bakong"
            : "Order placed successfully!"}
        </h1>
        <p className="mt-2 text-slate-500">
          {isPaid
            ? "Thank you! Your payment has been confirmed automatically."
            : showQr
            ? "Scan the QR code below with your ABA Mobile app to complete payment."
            : "Thank you for your purchase. Here are your order details."}
        </p>

        {/* Order details */}
        <div className="mt-8 bg-slate-50 rounded-2xl border border-slate-200 p-6 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Order ID</span>
            <span className="font-semibold text-slate-900">#{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <span
              className={`font-semibold capitalize ${
                isPaid ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {isPaid ? "Paid" : "Pending payment"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total</span>
            <span className="font-bold text-emerald-600">
              {formatPrice(order?.total_amount ?? 0)}
            </span>
          </div>
        </div>


        {/* QR Code — Scan & Pay (ABA / Bakong) */}
        {showQr && (
          <div className="mt-8 bg-white rounded-2xl border-2 border-emerald-100 p-6 animate-fade-in-up">
            <div className="mx-auto w-52 h-52 sm:w-56 sm:h-56 bg-white rounded-2xl border border-slate-200 shadow-soft p-3 flex items-center justify-center">
              <img
                src={order.payment_qr_url}
                alt="ABA Pay QR code"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="mt-4 text-lg font-bold text-slate-900">
              Scan to pay {formatPrice(order.total_amount)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Open <strong>ABA Mobile</strong> (or any Bakong wallet) → Scan QR →
              Confirm payment. The order updates automatically once paid.
            </p>

            <a
              href={order.payment_url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700"
            >
              Open ABA Pay checkout →
            </a>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-emerald-700">
              {confirming ? (
                <>
                  <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  Verifying payment…
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Waiting for payment…
                </>
              )}
            </div>
            {pollError && (
              <p className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                {pollError}
              </p>
            )}
          </div>
        )}

        {/* Paid confirmation */}
        {isPaid && (
          <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 animate-pop-in">
            <p className="text-lg font-bold text-emerald-700">
              ✓ Payment confirmed automatically
            </p>
            <p className="mt-1 text-sm text-emerald-700/80">
              Your order has been marked as paid. Thank you!
            </p>
          </div>
        )}

        {/* Fallback payment link (when ABA Pay is not configured) */}
        {!order?.payment_enabled && order?.payment_url && !isPaid && (
          <div className="mt-8 flex flex-col items-center gap-2 text-sm">
            <span className="text-slate-500">Payment link</span>
            <a
              href={order.payment_url}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 font-medium hover:underline break-all max-w-full"
            >
              {order.payment_url}
            </a>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700"
          >
            ← Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

