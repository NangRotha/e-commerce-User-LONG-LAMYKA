import { Link, useLocation } from "react-router-dom";
import { formatPrice } from "../lib/helpers";

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">
          ✅
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900">
          Order placed successfully!
        </h1>
        <p className="mt-2 text-slate-500">
          Thank you for your purchase. Here are your order details.
        </p>

        <div className="mt-8 bg-slate-50 rounded-2xl border border-slate-200 p-6 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Order ID</span>
            <span className="font-semibold text-slate-900">
              #{order.order_id}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <span className="font-semibold text-amber-600 capitalize">
              {order.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total paid</span>
            <span className="font-bold text-emerald-600">
              {formatPrice(order.total_amount)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Payment link</span>
            <a
              href={order.payment_url}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 font-medium hover:underline break-all text-right"
            >
              {order.payment_url}
            </a>
          </div>
        </div>

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
