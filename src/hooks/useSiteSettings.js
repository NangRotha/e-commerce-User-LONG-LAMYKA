import { useEffect, useCallback, useState } from "react";
import { api } from "../api/client";
import { useRealtime } from "../context/RealtimeContext";

/**
 * ទាញយក Site Settings (site_name, site_logo) ពី API
 * ហើយស្តាប់ព្រឹត្តិការណ៍ `settings_changed` (តាមរយៈ WebSocket តែមួយ)
 * (Admin ប្តូរ Logo / Site Name -> Storefront បញ្ចូលថ្មីដោយស្វ័យប្រវត្តិ)
 */
export default function useSiteSettings() {
  const [settings, setSettings] = useState({});

  const load = useCallback(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime("settings_changed", load);

  return settings;
}

