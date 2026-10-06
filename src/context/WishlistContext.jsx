import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const WISHLIST_KEY = "udom_wishlist";
const WISHLIST_ITEMS_KEY = "udom_wishlist_items";

function loadSavedIds() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadSavedItems() {
  try {
    const raw = localStorage.getItem(WISHLIST_ITEMS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(loadSavedIds);
  const [cachedItems, setCachedItems] = useState(loadSavedItems);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
    } catch {
      /* ignore */
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_ITEMS_KEY, JSON.stringify(cachedItems));
    } catch {
      /* ignore */
    }
  }, [cachedItems]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === WISHLIST_KEY) {
        setWishlistIds(loadSavedIds());
      }
      if (e.key === WISHLIST_ITEMS_KEY) {
        setCachedItems(loadSavedItems());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleWishlist = (product) => {
    if (!product || product.id === undefined) return;
    const pid = product.id;
    const exists = wishlistIds.some((id) => String(id) === String(pid));

    if (exists) {
      setWishlistIds((prev) => prev.filter((id) => String(id) !== String(pid)));
      setCachedItems((prev) => prev.filter((item) => String(item.id) !== String(pid)));
      setToastMessage({ type: "removed", product });
    } else {
      setWishlistIds((prev) => [...prev, pid]);
      setCachedItems((prev) => {
        const filtered = prev.filter((item) => String(item.id) !== String(pid));
        return [product, ...filtered];
      });
      setToastMessage({ type: "added", product });
    }
  };

  const isWished = (productId) => {
    if (productId === undefined || productId === null) return false;
    return wishlistIds.some((id) => String(id) === String(productId));
  };

  const clearWishlist = () => {
    setWishlistIds([]);
    setCachedItems([]);
  };

  const dismissToast = () => setToastMessage(null);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        cachedItems,
        count: wishlistIds.length,
        toggleWishlist,
        isWished,
        clearWishlist,
        toastMessage,
        dismissToast,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}
