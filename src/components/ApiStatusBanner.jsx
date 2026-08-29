import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function ApiStatusBanner() {
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
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
      ⚠️ Cannot reach the backend API. Start it with:{" "}
      <code className="font-semibold bg-amber-100 px-1.5 py-0.5 rounded">
        cd backend && .venv/bin/uvicorn app.main:app --reload
      </code>{" "}
      (or run <code className="font-semibold">npm run dev:all</code>)
    </div>
  );
}
