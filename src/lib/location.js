/**
 * Store Location & Google Maps Configuration
 * Google Maps link: https://maps.app.goo.gl/EaQbHNijNE7EHgmFA?g_st=ic
 * Coordinates: 11.5385935, 104.8904647
 */
export const STORE_LOCATION = {
  mapsUrl: "https://maps.app.goo.gl/EaQbHNijNE7EHgmFA?g_st=ic",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=11.5385935,104.8904647",
  lat: 11.5385935,
  lng: 104.8904647,
  // OpenStreetMap embed coordinates centered around the store pin
  osmEmbedUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=104.884,11.533,104.897,11.544&layer=mapnik&marker=11.5385935,104.8904647",
  addressKm:
    "ផ្លូវចាក់សំរាម ស្ទឹងមានជ័យ, ភូមិដំណាក់ធំ, សង្កាត់ស្ទឹងមានជ័យទី២, ខណ្ឌមានជ័យ, រាជធានីភ្នំពេញ",
  addressEn:
    "Stoeung Meanchey, Phum Damnak Thum, Sangkat Stung Meanchey 2, Khan Meanchey, Phnom Penh, Cambodia",
  areaKm: "ស្ទឹងមានជ័យ, រាជធានីភ្នំពេញ",
  areaEn: "Stung Meanchey, Phnom Penh",
  hoursKm: "៨:០០ ព្រឹក - ៨:៣០ យប់ (រៀងរាល់ថ្ងៃ)",
  hoursEn: "8:00 AM - 8:30 PM (Everyday)",
  deliveryKm: "សេវាដឹករហ័ស Grab · Foodpanda · Nham24 · ផ្ញើ ២៥ ខេត្ត-ក្រុង",
  deliveryEn: "Fast Delivery via Grab · Foodpanda · Nham24 · 25 Provinces",
};

/**
 * Extract clean embed URL from raw text or <iframe ... src="..."> snippet
 */
export function extractMapEmbedUrl(raw) {
  if (!raw) return "";
  const str = String(raw).trim();
  if (!str) return "";
  const match = str.match(/<iframe[^>]*\s+src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  if (str.startsWith("http://") || str.startsWith("https://")) {
    return str;
  }
  return str;
}

/**
 * Resolve the map embed URL with priority to custom embed URL, then default OSM pin
 */
export function resolveMapEmbedUrl(customEmbed, fallback = STORE_LOCATION.osmEmbedUrl) {
  const extracted = extractMapEmbedUrl(customEmbed);
  if (extracted) return extracted;
  return fallback;
}
