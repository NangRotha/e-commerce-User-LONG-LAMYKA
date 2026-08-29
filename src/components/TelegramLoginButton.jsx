import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

/**
 * ប៊ូតុង "Login with Telegram" (Telegram Login Widget)
 *
 * សំខាន់៖ Telegram widget script ស្វែងរកតែ `script[data-telegram-login]` ប៉ុណ្ណោះ
 * (មិនមែន <div data-telegram-login> ទេ)។ ដូច្នេះយើងត្រូវ Inject script tag ដែលមាន
 * data attributes ចូលក្នុង container ហើយ widget នឹងជំនួសវាដោយប៊ូតុង Login។
 */
export default function TelegramLoginButton({ redirect = "/" }) {
  const { loginWithTelegram } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");
  const [scriptFailed, setScriptFailed] = useState(false);

  const handleAuthRef = useRef(null);
  const handleAuth = useCallback(
    async (tgUser) => {
      setError("");
      try {
        await loginWithTelegram(tgUser);
        navigate(redirect, { replace: true });
      } catch (e) {
        setError(e.message);
      }
    },
    [loginWithTelegram, navigate, redirect]
  );
  handleAuthRef.current = handleAuth;

  useEffect(() => {
    let cancelled = false;
    api
      .getTelegramConfig()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch(() => {
        if (!cancelled) setConfig({ enabled: false, bot_username: "" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!config?.enabled) return;

    // Telegram widget ហៅ function សកលនេះ ពេលអ្នកប្រើបានបញ្ជាក់អត្តសញ្ញាណ
    window.onTelegramAuth = (tgUser) => handleAuthRef.current(tgUser);
    setScriptFailed(false);

    // លុប script ចាស់ដែលបាន inject ពីមុន (ពេល HMR / navigate)
    const old = document.getElementById("telegram-widget-js");
    if (old) old.remove();

    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    // Inject script tag ដែលមាន data-telegram-login
    // (widget នឹងជំនួស script នេះដោយប៊ូតុង Login ពិតប្រាកដ)
    const s = document.createElement("script");
    s.id = "telegram-widget-js";
    s.async = true;
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.setAttribute("data-telegram-login", config.bot_username);
    s.setAttribute("data-size", "large");
    s.setAttribute("data-radius", "10");
    s.setAttribute("data-onauth", "onTelegramAuth");
    s.onerror = () => setScriptFailed(true);
    container.appendChild(s);

    return () => {
      delete window.onTelegramAuth;
    };
    // bot_username មិនប្តូរទេ ពេលដែល enabled — គ្រាន់តែចង់ឲ្យ effect រត់ពេល enabled ប្តូរ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.enabled]);

  if (!config) return null;

  if (!config.enabled) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex items-center gap-2.5 w-64 max-w-full justify-center px-5 py-3 rounded-lg bg-slate-200 text-slate-500 cursor-not-allowed select-none"
          title="Enable Telegram login by setting TELEGRAM_BOT_TOKEN in backend/.env"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
            <path d="M9.04 15.27l-.54 3.81c.57 0 .82-.25 1.11-.54l2.67-2.58 5.53 4.08c1.01.56 1.73.27 2-.94l3.63-17.1c.37-1.67-.6-2.32-1.7-1.91L1.07 9.95c-1.61.63-1.59 1.54-.27 1.94l5.34 1.67L17.2 5.7c.66-.43 1.27-.2.77.24L9.04 15.27z" />
          </svg>
          Login with Telegram
        </div>
        <p className="text-xs text-amber-600 font-medium text-center">
          មិនទាន់បើកទេ — ម្ចាស់ហាងត្រូវការកំណត់ Telegram Bot ជាមុនសិន។
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} className="min-h-[50px] flex items-center justify-center" />
      {scriptFailed && (
        <p className="mt-2 text-xs text-rose-600 text-center">
          មិនអាចផ្ទុក Telegram widget បានទេ — សូមពិនិត្យ internet connection របស់អ្នក។
        </p>
      )}
      {error && (
        <p className="mt-2 w-full text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
    </div>
  );
}


