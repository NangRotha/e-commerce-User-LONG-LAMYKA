import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { effectivePrice, formatPrice } from "../lib/helpers";
import { api } from "../api/client";
import useProductsRealtime from "../hooks/useProductsRealtime";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    api
      .getProduct(id)
      .then((p) => {
        setProduct(p);
        setQty(1);
        setActiveImage(0);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  // បច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ៖ ពេល Admin កែផលិតផលនេះ -> ទាញទិន្នន័យថ្មីមកបង្ហាញភ្លាមៗ
  useProductsRealtime(() => {
    api
      .getProduct(id)
      .then((p) => {
        setProduct(p);
        setQty((q) => Math.min(q, Math.max(1, p.stock)));
      })
      .catch((e) => {
        // ផលិតផលត្រូវបានលុប ឬបណ្តាញមានបញ្ហា — បង្ហាញថាលែងមានទៀត
        setProduct(null);
        setError(e.message || "This product is no longer available");
      });
  });

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-2xl font-bold">{error}</h1>
        <Link to="/" className="mt-4 inline-block text-emerald-600 font-medium">
          ← Back to shop
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 animate-pulse">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-3 w-1/4 bg-slate-200 rounded" />
            <div className="h-8 w-3/4 bg-slate-200 rounded" />
            <div className="h-5 w-1/3 bg-slate-200 rounded" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const price = effectivePrice(product);
  const onSale = product.is_on_sale && product.sale_percent > 0;
  const outOfStock = product.stock <= 0;
  // បញ្ជីរូបភាពទាំងអស់ (រូបទី១ = Main) — គាំទ្ររូបភាពច្រើនសន្លឹក
  const images =
    product.images && product.images.length
      ? product.images
      : product.image_url
      ? [product.image_url]
      : [];
  const activeImg = images[activeImage] || product.image_url;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/"
        className="text-sm text-slate-500 hover:text-emerald-600 transition"
      >
        ← Back to shop
      </Link>

      <div className="mt-6 grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* Image gallery (Main + supporting) */}
        <div className="animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
            {activeImg ? (
              <img
                key={activeImage}
                src={activeImg}
                alt={product.name}
                className="w-full aspect-square object-cover animate-fade-in"
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-8xl bg-slate-100">
                📦
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {images.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 active:scale-95 ${
                    i === activeImage
                      ? "border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    src={url}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-emerald-600">
              {formatPrice(price)}
            </span>
            {onSale && (
              <>
                <span className="text-xl text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-gradient-to-r from-rose-600 to-rose-500 text-white text-sm font-bold px-2 py-1 rounded-full animate-pop-in">
                  -{Math.round(product.sale_percent)}%
                </span>
              </>
            )}
          </div>

          <p className="mt-6 text-slate-600 leading-relaxed">
            {product.description || "No description available."}
          </p>

          <p className="mt-4 text-sm">
            {outOfStock ? (
              <span className="text-rose-600 font-semibold">Out of stock</span>
            ) : (
              <span className="text-slate-500">
                <span className="font-semibold text-emerald-600">
                  {product.stock} in stock
                </span>{" "}
                · Ready to ship
              </span>
            )}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-slate-200 rounded-2xl overflow-hidden shadow-soft">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
                className="px-4 py-2.5 text-lg font-bold text-slate-600 hover:bg-slate-100 transition active:scale-90 disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-4 py-2.5 text-lg font-semibold min-w-12 text-center border-x border-slate-200">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={outOfStock}
                className="px-4 py-2.5 text-lg font-bold text-slate-600 hover:bg-slate-100 transition active:scale-90 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex-1 px-6 py-3.5 rounded-2xl text-white font-semibold transition-all duration-200 active:scale-95 ${
                added
                  ? "bg-emerald-600 shadow-lift"
                  : "bg-emerald-600 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lift"
              } disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100`}
            >
              {outOfStock ? "Sold out" : added ? "✓ Added!" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
