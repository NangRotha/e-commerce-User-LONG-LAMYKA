import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import useSlidesRealtime from "../hooks/useSlidesRealtime";
import { useI18n } from "../i18n/I18nContext";

export function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

const INTERVAL_MS = 5000;

function IconBase({ className, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function ChevronLeftIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M15 18l-6-6 6-6" />
    </IconBase>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M9 18l6-6-6-6" />
    </IconBase>
  );
}

function PlayIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function PauseIcon({ className }) {
  return (
    <IconBase className={className}>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </IconBase>
  );
}

function CloseIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
    </IconBase>
  );
}

export default function HeroSlider({ fallback = null }) {
  const { t } = useI18n();
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playingYt, setPlayingYt] = useState(null); // youtube slide being watched
  const timerRef = useRef(null);

  const load = useCallback(() => {
    api.getSlides().then(setSlides).catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ពេល Admin បង្កើត/កែ/លុប Slide -> ផ្ទុកថ្មីដោយស្វ័យប្រវត្តិ
  useSlidesRealtime(load);

  const count = slides.length;

  const goTo = useCallback(
    (i) => {
      if (count === 0) return;
      setIndex(((i % count) + count) % count);
    },
    [count]
  );

  // Auto-play: ប្តូរ Slide ដោយស្វ័យប្រវត្តិរៀងរាល់ INTERVAL_MS
  // ប្រើ setTimeout (មិនមែន setInterval) ហើយដាក់ index ក្នុង dependency
  // ដូច្នេះពេលអ្នកប្រើចុច Arrow / Dot រាប់ម៉ោងត្រូវបាន reset ឡើងវិញ
  // (មិនលោតទៅ Slide បន្ទាប់ភ្លាមៗទេ)
  useEffect(() => {
    if (count <= 1 || paused || playingYt) return;
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % count);
    }, INTERVAL_MS);
    return () => clearTimeout(timerRef.current);
  }, [count, index, paused, playingYt]);

  // ចុច Arrow ឆ្វេង/ស្តាំ លើក្តារចុច -> ប្តូរ Slide (មិនរំខានពេលកំពុងវាយបញ្ចូល)
  useEffect(() => {
    if (count <= 1) return;
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      else if (e.key === "ArrowLeft") setIndex((i) => ((i - 1) % count + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  // បើ Admin លុប Slide ឲ្យចំនួនតិចជាង index បច្ចុប្បន្ន -> កែ index កុំឲ្យហួសដែន
  useEffect(() => {
    if (count > 0 && index >= count) setIndex(0);
  }, [count, index]);

  // បើគ្មាន Slide -> បង្ហាញ Fallback (Hero ធម្មតាពី Home)
  if (count === 0) return fallback;

  const current = slides[index] || slides[0];
  const ytId = current.media_type === "youtube" ? getYouTubeId(current.youtube_url) : null;
  const isLast = index === count - 1;

  return (
    <div
      className="relative w-full overflow-hidden bg-slate-900 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide media + text */}
      <div className="relative w-full flex items-center justify-center bg-slate-950 overflow-hidden min-h-[160px] sm:min-h-[260px] md:min-h-[340px]">
        {/* Ambient blurred backdrop for ultrawide screens */}
        {current.media_url && (
          <div
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${current.media_url})` }}
            aria-hidden="true"
          />
        )}

        {/* Foreground Image - 100% full, uncropped */}
        {current.media_type === "image" && current.media_url && (
          <div className="relative z-10 w-full flex items-center justify-center">
            {current.link_url ? (
              <a href={current.link_url} className="block w-full text-center">
                <img
                  src={current.media_url}
                  alt={current.title || "Slide banner"}
                  className="w-full h-auto max-h-[640px] sm:max-h-[720px] object-contain mx-auto block select-none drop-shadow-sm"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </a>
            ) : (
              <img
                src={current.media_url}
                alt={current.title || "Slide banner"}
                className="w-full h-auto max-h-[640px] sm:max-h-[720px] object-contain mx-auto block select-none drop-shadow-sm"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
          </div>
        )}

        {/* Video */}
        {current.media_type === "video" && current.media_url && (
          <video
            src={current.media_url}
            autoPlay
            muted
            loop
            playsInline
            className="relative z-10 w-full h-auto max-h-[640px] sm:max-h-[720px] object-contain mx-auto block"
          />
        )}

        {/* YouTube */}
        {current.media_type === "youtube" && ytId && (
          <div className="relative z-10 w-full max-w-6xl mx-auto aspect-video max-h-[640px]">
            <iframe
              key={`yt-${index}`}
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&modestbranding=1&rel=0&playsinline=1`}
              title={current.title || "YouTube video"}
              className="absolute inset-0 h-full w-full pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              tabIndex="-1"
            />
          </div>
        )}

        {/* Overlay gradient + text — ONLY show when title or subtitle is provided */}
        {(current.title || current.subtitle) && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent z-15 pointer-events-none" />
            <div className="absolute inset-0 flex items-center z-20 pointer-events-none">
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
                <div className="max-w-xl pointer-events-auto">
                  {current.title && (
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
                      {current.title}
                    </h1>
                  )}
                  {current.subtitle && (
                    <p className="mt-3 sm:mt-4 text-pink-100 text-base sm:text-lg drop-shadow max-w-lg">
                      {current.subtitle}
                    </p>
                  )}
                  {current.link_url && (
                    <a
                      href={current.link_url}
                      className="mt-5 sm:mt-7 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white font-black text-sm sm:text-base transition-all duration-300 shadow-cute-glow hover:scale-105 active:scale-95"
                    >
                      <span>✨</span>
                      <span>{t("product.shopNow")}</span>
                      <span>💖</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* YouTube: button to watch WITH sound (browsers only allow autoplay when muted) */}
        {current.media_type === "youtube" && ytId && (
          <button
            onClick={() => setPlayingYt(current)}
            className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium backdrop-blur transition flex items-center gap-2 z-20"
            aria-label="Watch with sound"
          >
            <PlayIcon className="w-4 h-4 fill-white ml-0.5" />
            {t("product.watchWithSound")}
          </button>
        )}
      </div>

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur transition z-20 shadow-md"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur transition z-20 shadow-md"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-gradient-to-r from-pink-400 to-rose-400 shadow-sm" : "w-2 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Play / Pause button */}
      {count > 1 && (
        <button
          onClick={() => setPaused((p) => !p)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur transition z-20 shadow-md"
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          title={paused ? "Play" : "Pause"}
        >
          {paused ? (
            <PlayIcon className="w-4 h-4 fill-white ml-0.5" />
          ) : (
            <PauseIcon className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Auto-play progress bar (countdown to next slide) */}
      {count > 1 && !paused && !playingYt && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            key={index}
            className="h-full bg-gradient-to-r from-pink-400 to-rose-500"
            style={{ animation: `heroProgress ${INTERVAL_MS}ms linear forwards` }}
          />
        </div>
      )}

      {/* YouTube lightbox */}
      {playingYt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"
          onClick={() => setPlayingYt(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(playingYt.youtube_url)}?autoplay=1`}
              title="YouTube video player"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Screen-reader hint for last slide */}
      {isLast && <span className="sr-only">Last slide</span>}
    </div>
  );
}

