import { useRealtime } from "../context/RealtimeContext";

/**
 * ស្តាប់ព្រឹត្តិការណ៍ `slides_changed` ពី Backend (តាមរយៈ WebSocket តែមួយ)
 * (Admin បង្កើត/កែ/លុប Slide -> Storefront ផ្ទុក Slide ថ្មីដោយស្វ័យប្រវត្តិ)
 */
export default function useSlidesRealtime(onChange) {
  useRealtime("slides_changed", onChange);
}

