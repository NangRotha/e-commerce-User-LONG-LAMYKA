import { useEffect, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nContext";

// AI bot animation (dotLottie) from lottie.host
const LOTTIE_URL =
  "https://lottie.host/563cc933-f47b-4d29-982c-9b61ca08850a/Bh3gWVYqOs.lottie";

function SendIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function BotIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <circle cx="12" cy="14" r="2" />
      <path d="M12 8V4M8 4h8" />
    </svg>
  );
}

export default function ChatWidget() {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api
      .getChatConfig()
      .then((c) => setEnabled(!!c.enabled))
      .catch(() => setEnabled(false));
  }, []);

  // Scroll to bottom when messages/typing change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  if (enabled === null) return null;
  if (!enabled) return null;

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || typing) return;

    setMessages((m) => [...m, { role: "user", content: message }]);
    setInput("");
    setError("");
    setTyping(true);

    try {
      // ផ្ញើ history ពីមុន (ក្រៅពីសារថ្មី) ដើម្បីឲ្យ AI ចងចាំការសន្ទនា
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.sendChatMessage(message, history);
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setError(e.message);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: t("chat.error") },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-1.5 pointer-events-none">
        {!open && (
          <div className="pointer-events-auto animate-bounce-soft hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#120e1a]/95 border border-purple-200 dark:border-purple-900 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-soft">
            <span>✨ Need help? Chat with AI 💬</span>
          </div>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="pointer-events-auto clay-circle-btn !w-14 !h-14 sm:!w-16 sm:!h-16 shadow-soft flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label={open ? t("chat.close") : t("chat.open")}
        >
          {open ? (
            <CloseIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-pop-in" />
          ) : (
            <div className="relative w-full h-full p-2">
              {/* Fallback icon while the Lottie animation loads */}
              <BotIcon className="absolute inset-0 m-auto w-8 h-8 text-purple-500" />
              <DotLottieReact
                src={LOTTIE_URL}
                loop
                autoplay
                className="absolute inset-0"
              />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-white dark:border-[#120e1a] animate-ping" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white dark:border-[#120e1a]" />
            </div>
          )}
        </button>
      </div>

      {/* Chat panel — mobile: bottom sheet full width / desktop: bottom-right card */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden clay-card shadow-soft transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-6 scale-95 pointer-events-none"
        } inset-x-0 bottom-0 w-full h-[min(580px,85dvh)] !rounded-t-[32px] sm:!rounded-b-[0px] origin-bottom sm:inset-x-auto sm:right-6 sm:bottom-24 sm:h-[min(620px,72vh)] sm:w-[410px] sm:max-w-[calc(100vw-2.5rem)] sm:!rounded-[32px] sm:origin-bottom-right`}
        role="dialog"
        aria-label={t("chat.panelAria")}
      >
        {/* Header */}
        <div className="shrink-0 clay-nav-active text-white px-5 py-4 flex items-center gap-3 shadow-sm">
          <div className="relative w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/30 shadow-inner">
            <DotLottieReact
              src={LOTTIE_URL}
              loop
              autoplay
              style={{ width: 44, height: 44 }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-base leading-tight flex items-center gap-1.5">
              <span>✨</span>
              <span>{t("chat.title")}</span>
            </p>
            <p className="text-xs text-purple-100/90 font-medium flex items-center gap-1.5 truncate mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shrink-0" />
              <span>{t("chat.subtitle")}</span>
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition active:scale-90"
            aria-label={t("chat.close")}
          >
            <CloseIcon className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="px-4 py-4 space-y-3 overflow-y-auto flex-1 min-h-0 admin-mesh-bg">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 text-sm pt-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-2xl mb-2 shadow-soft animate-bounce-soft">
                💬
              </div>
              <p className="font-extrabold text-slate-800 dark:text-purple-100">{t("chat.greeting")}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{t("chat.askAnything")}</p>
              <div className="mt-4 space-y-2">
                {t("chat.suggestions").map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="w-full text-left text-xs bg-white/90 dark:bg-[#120e1a]/90 hover:bg-purple-50 dark:hover:bg-[#1f152b] hover:text-purple-600 dark:hover:text-purple-300 border border-purple-200/80 dark:border-purple-900/50 rounded-2xl px-4 py-3 transition-all duration-200 hover:translate-x-1 text-slate-700 dark:text-purple-100 font-bold shadow-2xs flex items-center justify-between group"
                  >
                    <span>{s}</span>
                    <span className="text-purple-400 opacity-60 group-hover:opacity-100 transition-opacity">✨</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap animate-fade-in-up font-semibold ${
                  m.role === "user"
                    ? "clay-nav-active text-white rounded-3xl rounded-br-sm shadow-soft"
                    : "clay-card text-slate-800 dark:text-purple-100 rounded-3xl rounded-bl-sm shadow-2xs"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="clay-card rounded-3xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="px-4 pb-2 text-xs text-rose-500 font-bold">{error}</p>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="shrink-0 border-t border-purple-100 dark:border-purple-900/50 p-3 flex items-center gap-2 bg-white/95 dark:bg-[#120e1a]/95"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.placeholder")}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-white/90 dark:bg-[#181124] text-slate-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm placeholder:text-purple-300 dark:placeholder:text-purple-600 transition duration-200 font-semibold"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="shrink-0 w-10 h-10 rounded-2xl clay-nav-active text-white flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-40 active:scale-95 shadow-soft"
            aria-label={t("chat.send")}
          >
            <SendIcon className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </>
  );
}

