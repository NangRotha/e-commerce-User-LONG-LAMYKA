import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../api/client";
import { formatPrice } from "../lib/helpers";

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState(null); // { percent }
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  // តម្រូវឱ្យចូលប្រើមុនពេល Checkout
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { redirect: "/checkout" }, replace: true });
    }
  }, [user, navigate]);

  const applyPromo = async () => {
    setPromoError("");
    setPromo(null);
    setPromoApplied(false);
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }
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
    if (!address.trim()) {
      setError("Please enter your shipping address.");
      return;
    }
    setPlacing(true);
    try {
      const res = await api.checkout({
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        promo_code: promo ? promoCode.trim() : null,
        shipping_address: address.trim(),
      });
      clear();
      navigate("/order-success", { state: { order: res } });
    } catch (e) {
      setError(e.message);
      setPlacing(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        Redirecting to login...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-slate-800">
          Nothing to check out
        </h1>
        <p className="mt-2 text-slate-500">Your cart is empty.</p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700"
        >
          ← Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
        Checkout
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Logged in as <span className="font-medium">{user.email}</span>
      </p>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900">
              1. Shipping address
            </h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Full name, street address, city, country..."
              className="mt-4 w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900">2. Promo code</h2>
            <div className="mt-4 flex gap-3">
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE10"
                disabled={promoApplied}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
              />
              {promoApplied ? (
                <button
                  onClick={removePromo}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={applyPromo}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
                >
                  Apply
                </button>
              )}
            </div>
            {promoApplied && promo && (
              <p className="mt-3 text-sm text-emerald-600 font-medium">
                ✓ Promo applied: -{promo.percent}% off
              </p>
            )}
            {promoError && (
              <p className="mt-3 text-sm text-rose-600">{promoError}</p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
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
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatPrice(subtotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({promo.percent}%)</span>
                <span className="font-semibold">−{formatPrice(discount)}</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-lg font-bold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          {error && (
            <p className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            onClick={placeOrder}
            disabled={placing}
            className="mt-6 w-full px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {placing ? "Placing order..." : "Place order"}
          </button>
          <Link
            to="/cart"
            className="mt-3 block w-full text-center px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium transition hover:bg-slate-50"
          >
            ← Back to cart
          </Link>
        </div>
      </div>
    </div>
  );
}
