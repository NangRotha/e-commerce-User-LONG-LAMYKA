import { useEffect, useState } from "react";
import { api, API_BASE } from "../api/client";
import { useI18n } from "../i18n/I18nContext";

export default function ApiStatusBanner() {
  const { t } = useI18n();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        await api.getSettings();
        if (!cancelled) setOffline(false);
      } catch {
        if (!cancelled) setOffline(true);
      }
    };

    check();
    const id = setInterval(check, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800 animate-fade-in">
      ⚠️ {t("offline.unreachable")}{" "}
      <code className="font-semibold bg-amber-100 px-1.5 py-0.5 rounded">
        {API_BASE}
      </code>
      . {t("offline.hint")}
    </div>
  );
}
