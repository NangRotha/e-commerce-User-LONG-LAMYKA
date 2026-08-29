import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { effectivePrice } from "../lib/helpers";
import { api } from "../api/client";
import { useRealtime } from "./RealtimeContext";

const CartContext = createContext(null);
const CART_KEY = "shop_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** ធ្វើបច្ចុប្បន្នភាព Cart ពីផលិតផលបច្ចុប្បន្ន (តម្លៃ/ស្តុក/ឈ្មោះ/រូប) */
function syncItems(items, products) {
  if (!Array.isArray(products) || !items.length) return items;
  const map = new Map(products.map((p) => [String(p.id), p]));
  const next = [];
  let changed = false;
  for (const item of items) {
    const live = map.get(String(item.id));
    if (!live) {
      changed = true; // ផលិតផលត្រូវបានលុប -> ដកចេញពី Cart
      continue;
    }
    const price = effectivePrice(live);
    const qty = Math.max(1, Math.min(item.quantity, Math.max(1, Number(live.stock) || 1)));
    const updated = {
      ...item,
      name: live.name,
      price,
      originalPrice: live.price,
      image_url: live.image_url,
      stock: Number(live.stock) || 0,
      is_on_sale: live.is_on_sale,
      quantity: qty,
    };
    if (
      item.name !== updated.name ||
      item.price !== updated.price ||
      item.image_url !== updated.image_url ||
      item.stock !== updated.stock ||
      item.quantity !== updated.quantity
    ) {
      changed = true;
    }
    next.push(updated);
  }
  return changed ? next : items;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
            : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: effectivePrice(product),
          originalPrice: product.price,
          image_url: product.image_url,
          stock: product.stock,
          is_on_sale: product.is_on_sale,
          quantity: Math.min(qty, product.stock),
        },
      ];
    });
  };

  const removeItem = (id) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id, qty) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) }
          : i
      )
    );

  const clear = () => setItems([]);

  // Sync Cart ជាមួយផលិតផលបច្ចុប្បន្ន (តម្លៃ/ស្តុក ថ្មី ពេល Admin កែផលិតផល)
  const syncWithProducts = (products) => {
    if (!products || !products.length) return;
    setItems((prev) => syncItems(prev, products));
  };

  // ពេល Admin បង្កើត/កែ/លុប ផលិតផល -> បញ្ចូល Cart ឱ្យទាន់សម័យដោយស្វ័យប្រវត្តិ (គ្រប់ទំព័រ)
  const refreshFromServer = () => {
    if (!itemsRef.current.length) return;
    api.getProducts().then(syncWithProducts).catch(() => {});
  };
  useRealtime("products_changed", refreshFromServer);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, syncWithProducts, subtotal, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
