import { useEffect, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { api } from "../api/client";

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

const SUGGESTIONS = [
  "What do you sell?",
  "Do you offer free shipping?",
  "Recommend a gift under $50",
];

export default function ChatWidget() {
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
        { role: "assistant", content: "Sorry, I couldn't reach the AI right now. Please try again." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-emerald-100 shadow-lift flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95"
        aria-label={open ? "Close chat" : "Open AI chat"}
      >
        {open ? (
          <CloseIcon className="w-7 h-7 text-emerald-700 animate-pop-in" />
        ) : (
          <div className="relative w-full h-full">
            {/* Fallback icon while the Lottie animation loads */}
            <BotIcon className="absolute inset-0 m-auto w-9 h-9 text-emerald-600" />
            <DotLottieReact
              src={LOTTIE_URL}
              loop
              autoplay
              className="absolute inset-0"
            />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat panel — mobile: bottom sheet full width / desktop: bottom-right card */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden border border-slate-100 bg-white shadow-lift transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-6 scale-95 pointer-events-none"
        } inset-x-0 bottom-0 w-full h-[min(560px,82dvh)] rounded-t-3xl origin-bottom sm:inset-x-auto sm:right-5 sm:bottom-24 sm:h-[min(600px,70vh)] sm:w-[400px] sm:max-w-[calc(100vw-2.5rem)] sm:rounded-3xl sm:origin-bottom-right`}
        role="dialog"
        aria-label="AI assistant chat"
      >
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-4 flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full bg-white/15 flex items-center justify-center overflow-hidden">
            <DotLottieReact
              src={LOTTIE_URL}
              loop
              autoplay
              style={{ width: 44, height: 44 }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold leading-tight">Shop Assistant</p>
            <p className="text-xs text-emerald-100 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse shrink-0" />
              AI E-Commerce Assistant· online
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="shrink-0 p-2 rounded-xl hover:bg-white/15 transition"
            aria-label="Close chat"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>



        {/* Messages */}
        <div className="px-4 py-4 space-y-3 overflow-y-auto flex-1 min-h-0">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 text-sm pt-2">
              <p className="text-2xl mb-1">👋</p>
              <p>Hi! I'm your AI shopping assistant.</p>
              <p className="mt-1">Ask me anything about our store.</p>
              <div className="mt-4 space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="w-full text-left text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl px-3 py-2.5 transition text-slate-600"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap animate-fade-in-up ${
                  m.role === "user"
                    ? "bg-emerald-600 text-white rounded-2xl rounded-br-md"
                    : "bg-slate-100 text-slate-700 rounded-2xl rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="px-4 pb-2 text-xs text-rose-600">{error}</p>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="shrink-0 border-t border-slate-100 p-3 flex items-center gap-2"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="shrink-0 w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center transition hover:bg-emerald-700 disabled:opacity-40 active:scale-90"
            aria-label="Send message"
          >
            <SendIcon className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </>
  );
}

