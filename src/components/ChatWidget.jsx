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
          <div className="pointer-events-auto animate-bounce-soft hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1E1324] border-2 border-pink-200 dark:border-pink-800 text-[11px] font-bold text-pink-600 dark:text-pink-300 shadow-marshmallow">
            <span>✨ Need help, sweetie? 💖</span>
          </div>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#1E1324] border-2 border-pink-300 dark:border-pink-700 shadow-cute-glow flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label={open ? t("chat.close") : t("chat.open")}
        >
          {open ? (
            <CloseIcon className="w-6 h-6 text-pink-600 dark:text-pink-400 animate-pop-in" />
          ) : (
            <div className="relative w-full h-full p-2">
              {/* Fallback icon while the Lottie animation loads */}
              <BotIcon className="absolute inset-0 m-auto w-8 h-8 text-pink-400" />
              <DotLottieReact
                src={LOTTIE_URL}
                loop
                autoplay
                className="absolute inset-0"
              />
              <span className="absolute 1 top-1 right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 border-2 border-white dark:border-[#1E1324] animate-ping" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-pink-500 border-2 border-white dark:border-[#1E1324]" />
            </div>
          )}
        </button>
      </div>

      {/* Chat panel — mobile: bottom sheet full width / desktop: bottom-right card */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden border-2 border-pink-200/80 dark:border-pink-900/60 bg-white/95 dark:bg-[#1A1122]/95 backdrop-blur-xl shadow-marshmallow transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-6 scale-95 pointer-events-none"
        } inset-x-0 bottom-0 w-full h-[min(580px,85dvh)] rounded-t-[32px] origin-bottom sm:inset-x-auto sm:right-6 sm:bottom-24 sm:h-[min(620px,72vh)] sm:w-[410px] sm:max-w-[calc(100vw-2.5rem)] sm:rounded-[32px] sm:origin-bottom-right`}
        role="dialog"
        aria-label="AI assistant chat"
      >
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white px-5 py-4 flex items-center gap-3 shadow-sm">
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
              <span>🎀</span>
              <span>{t("chat.title")}</span>
              <span>✨</span>
            </p>
            <p className="text-xs text-pink-100/90 font-medium flex items-center gap-1.5 truncate mt-0.5">
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
        <div className="px-4 py-4 space-y-3 overflow-y-auto flex-1 min-h-0 bg-[#FFF9FA]/60 dark:bg-[#160E1C]/60">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 text-sm pt-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-pink-100 dark:bg-pink-950/70 border border-pink-200 dark:border-pink-800 flex items-center justify-center text-2xl mb-2 shadow-soft animate-bounce-soft">
                🌸
              </div>
              <p className="font-bold text-slate-800 dark:text-pink-100">{t("chat.greeting")}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("chat.askAnything")}</p>
              <div className="mt-4 space-y-2">
                {t("chat.suggestions").map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="w-full text-left text-xs bg-white dark:bg-[#1E1324] hover:bg-pink-50 dark:hover:bg-pink-950/60 hover:text-pink-600 dark:hover:text-pink-300 border border-pink-200/80 dark:border-pink-900/50 rounded-2xl px-3.5 py-2.5 transition-all duration-200 hover:translate-x-1 text-slate-700 dark:text-pink-100 font-medium shadow-2xs flex items-center justify-between group"
                  >
                    <span>{s}</span>
                    <span className="text-pink-400 opacity-60 group-hover:opacity-100 transition-opacity">💖</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap animate-fade-in-up font-medium ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white rounded-3xl rounded-br-sm shadow-soft"
                    : "bg-white dark:bg-[#1E1324] text-slate-800 dark:text-pink-100 border border-pink-100 dark:border-pink-900/60 rounded-3xl rounded-bl-sm shadow-2xs"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-[#1E1324] border border-pink-100 dark:border-pink-900/60 rounded-3xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="px-4 pb-2 text-xs text-rose-500 font-medium">{error}</p>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="shrink-0 border-t border-pink-100 dark:border-pink-900/50 p-3 flex items-center gap-2 bg-white dark:bg-[#1A1122]"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.placeholder")}
            className="flex-1 px-4 py-2.5 rounded-full border border-pink-200 dark:border-pink-900/60 bg-pink-50/50 dark:bg-[#20142A] text-slate-900 dark:text-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white dark:focus:bg-[#20142A] text-sm placeholder:text-pink-300 dark:placeholder:text-pink-700/60 transition duration-200 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white flex items-center justify-center transition-all duration-200 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 active:scale-90 shadow-cute-glow"
            aria-label={t("chat.send")}
          >
            <SendIcon className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </>
  );
}

