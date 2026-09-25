import { useEffect, useCallback, useState } from "react";
import { api } from "../api/client";
import { useRealtime } from "../context/RealtimeContext";

const STORAGE_KEY_LOGO = "site_logo";
const STORAGE_KEY_NAME = "site_name";

/**
 * ធ្វើបច្ចុប្បន្នភាព Favicon & Site Icons គ្រប់ទម្រង់៖
 * - <link rel="icon">
 * - <link rel="shortcut icon">
 * - <link rel="apple-touch-icon">
 * - <meta property="og:image"> និង <meta name="twitter:image">
 */
export function updateFavicon(logoUrl) {
  const url = (logoUrl || "").trim();
  const targetUrl = url || "/favicon.ico";

  try {
    if (url) {
      localStorage.setItem(STORAGE_KEY_LOGO, url);
    }
  } catch (e) {}

  // រក MIME type តាមកន្ទុយ File
  let mime = "";
  const clean = targetUrl.split("?")[0].toLowerCase();
  if (clean.endsWith(".svg")) mime = "image/svg+xml";
  else if (clean.endsWith(".png")) mime = "image/png";
  else if (clean.endsWith(".ico")) mime = "image/x-icon";
  else if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) mime = "image/jpeg";
  else if (clean.endsWith(".webp")) mime = "image/webp";

  // Browser ទំនើប (Chrome / Safari / Firefox) តែងតែ Cache favicon តាម DOM Node
  // លុប Tag ចាស់ៗចេញទាំងអស់ រួចបញ្ចូល Tag ថ្មីដើម្បីបង្ខំឱ្យ Browser ប្តូរភ្លាមៗ
  const oldIcons = document.querySelectorAll(
    "link[rel*='icon'], link[rel='apple-touch-icon']"
  );
  oldIcons.forEach((el) => el.remove());

  // 1. Primary Favicon
  const icon = document.createElement("link");
  icon.rel = "icon";
  if (mime) icon.type = mime;
  icon.href = targetUrl;
  document.head.appendChild(icon);

  // 2. Shortcut Icon (សម្រាប់ Desktop / Search Engines / Crawlers)
  const shortcut = document.createElement("link");
  shortcut.rel = "shortcut icon";
  if (mime) shortcut.type = mime;
  shortcut.href = targetUrl;
  document.head.appendChild(shortcut);

  // 3. Apple Touch Icon (សម្រាប់ iOS Safari / Home Screen Bookmarks)
  const apple = document.createElement("link");
  apple.rel = "apple-touch-icon";
  apple.href = url || "/apple-touch-icon.png";
  document.head.appendChild(apple);

  // 4. OpenGraph & Twitter image preview
  const ogImg = document.querySelector("meta[property='og:image']");
  if (ogImg) ogImg.setAttribute("content", url || "/logo.png");
  const twImg = document.querySelector("meta[name='twitter:image']");
  if (twImg) twImg.setAttribute("content", url || "/logo.png");
}

/**
 * អនុវត្ត Branding លើ Browser Tab៖
 * - document.title = site_name (ពី Database)
 * - favicon (title icon) = site_logo (ពី Database)
 */
export function applyBranding(settings = {}) {
  const name = (settings.site_name || "").trim();
  if (name) {
    try {
      localStorage.setItem(STORAGE_KEY_NAME, name);
    } catch (e) {}
    const formattedTitle = name.includes("Official")
      ? name
      : `${name} — Official Store 🎀`;
    if (document.title !== formattedTitle) {
      document.title = formattedTitle;
    }
  }

  const logo = (settings.site_logo || "").trim();
  if (logo) {
    updateFavicon(logo);
  }
}

// ទាញយក Setting ដំបូងពី localStorage (បើមាន) ជួយឱ្យ Tab Icon បង្ហាញភ្លាម 0ms
function getInitialSettings() {
  try {
    const cachedLogo = localStorage.getItem(STORAGE_KEY_LOGO) || "";
    const cachedName = localStorage.getItem(STORAGE_KEY_NAME) || "";
    if (cachedLogo || cachedName) {
      return {
        site_logo: cachedLogo,
        site_name: cachedName,
      };
    }
  } catch (e) {}
  return {};
}

// Module-level Cache & Pub-Sub ដើម្បីការពារកុំឱ្យបាញ់ Request ជាន់គ្នា
let globalSettings = getInitialSettings();
let inFlightPromise = null;
const subscribers = new Set();

function broadcastSettings(newSettings) {
  globalSettings = { ...globalSettings, ...newSettings };
  applyBranding(globalSettings);
  subscribers.forEach((cb) => {
    try {
      cb(globalSettings);
    } catch (e) {}
  });
}

export function fetchSiteSettings(force = false) {
  if (inFlightPromise && !force) {
    return inFlightPromise;
  }
  inFlightPromise = api
    .getSettings()
    .then((data) => {
      broadcastSettings(data);
      return data;
    })
    .catch(() => {
      return globalSettings;
    })
    .finally(() => {
      inFlightPromise = null;
    });
  return inFlightPromise;
}

// អនុវត្ត branding ដំបូងភ្លាមៗពេល File នេះត្រូវបាន load
if (typeof window !== "undefined") {
  applyBranding(globalSettings);
}

/**
 * ទាញយក Site Settings (site_name, site_logo) ពី API
 * ហើយស្តាប់ព្រឹត្តិការណ៍ `settings_changed` (តាមរយៈ WebSocket តែមួយ)
 * (Admin ប្តូរ Logo / Site Name -> Storefront បញ្ចូលថ្មីដោយស្វ័យប្រវត្តិ)
 */
export default function useSiteSettings() {
  const [settings, setSettings] = useState(globalSettings);

  useEffect(() => {
    subscribers.add(setSettings);
    fetchSiteSettings();
    return () => {
      subscribers.delete(setSettings);
    };
  }, []);

  const reload = useCallback(() => {
    fetchSiteSettings(true);
  }, []);

  useRealtime("settings_changed", reload);

  return settings;
}

