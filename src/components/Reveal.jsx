import { useEffect, useRef, useState } from "react";

/**
 * រុំជុំវិញ content ដើម្បីបង្ហាញដោយស្វ័យប្រវត្តិពេលអ្នកប្រើ Scroll មកដល់
 * (fade-in-up animation)។ `delay` = ពន្យាពេលគិតជា ms (សម្រាប់ stagger)។
 */
export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // IntersectionObserver មិនគាំទ្រ (browser ចាស់) -> បង្ហាញភ្លាមៗ
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "revealed" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
