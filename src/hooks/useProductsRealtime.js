import { useRealtime } from "../context/RealtimeContext";

/**
 * ស្តាប់ព្រឹត្តិការណ៍ `products_changed` ពី Backend (តាមរយៈ WebSocket តែមួយ)
 * ពេល Admin បង្កើត/កែ/លុប ផលិតផល ឬ Category -> ហៅ onChange() ដោយស្វ័យប្រវត្តិ។
 * Returns: connected (bool) — true ពេល WebSocket កំពុងតភ្ជាប់
 */
export default function useProductsRealtime(onChange) {
  return useRealtime("products_changed", onChange);
}

