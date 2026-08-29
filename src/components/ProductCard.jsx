import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { effectivePrice, formatPrice } from "../lib/helpers";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const price = effectivePrice(product);
  const outOfStock = product.stock <= 0;
  const onSale = product.is_on_sale && product.sale_percent > 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift flex flex-col">
      {/* Image */}
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-square bg-slate-100 overflow-hidden"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            📦
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Sale badge */}
        {onSale && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-600 to-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md animate-pop-in">
            -{Math.round(product.sale_percent)}%
          </span>
        )}

        {/* Stock badge */}
        {outOfStock && (
          <span className="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur">
            Sold out
          </span>
        )}

        {/* Quick view hint on hover */}
        <div className="absolute bottom-3 inset-x-3 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span className="bg-white/90 backdrop-blur text-slate-800 text-xs font-semibold px-4 py-2 rounded-full shadow-md">
            View details
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
            {product.category}
          </p>
        )}
        <Link
          to={`/product/${product.id}`}
          className="mt-1.5 font-semibold text-slate-800 line-clamp-2 leading-snug transition-colors duration-200 hover:text-emerald-600"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-slate-900">
              {formatPrice(price)}
            </span>
            {onSale && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={outOfStock ? "Sold out" : "Add to cart"}
            className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              justAdded
                ? "bg-emerald-600 text-white scale-105"
                : "bg-slate-900 text-white hover:bg-emerald-600 active:scale-95"
            } disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:active:scale-100`}
          >
            {justAdded ? (
              <span className="inline-flex items-center gap-1 animate-pop-in">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Added
              </span>
            ) : outOfStock ? (
              "Sold out"
            ) : (
              "Add"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

