import { useEffect, useCallback, useState } from "react";
import { api } from "../api/client";
import { useRealtime } from "../context/RealtimeContext";

/**
 * អនុវត្ត Branding លើ Browser Tab៖
 * - document.title = site_name (ពី Database)
 * - favicon (icon) = site_logo (ពី Database)
 */
function applyBranding(settings, fallbackTitle) {
  const name = settings.site_name || fallbackTitle;
  if (name && document.title !== name) document.title = name;

  const logo = settings.site_logo || "";
  if (!logo) return; // មិនមាន Logo -> ទុក default icon (vite.svg)

  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (link.getAttribute("href") !== logo) {
    link.setAttribute("href", logo);
    link.setAttribute(
      "type",
      logo.toLowerCase().endsWith(".svg") ? "image/svg+xml" : ""
    );
  }
}

/**
 * ទាញយក Site Settings (site_name, site_logo) ពី API
 * ហើយស្តាប់ព្រឹត្តិការណ៍ `settings_changed` (តាមរយៈ WebSocket តែមួយ)
 * (Admin ប្តូរ Logo / Site Name -> Storefront បញ្ចូលថ្មីដោយស្វ័យប្រវត្តិ)
 */
export default function useSiteSettings() {
  const [settings, setSettings] = useState({});

  const load = useCallback(() => {
    api
      .getSettings()
      .then((s) => {
        setSettings(s);
        applyBranding(s, "E-Commerce Store");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime("settings_changed", load);

  return settings;
}

