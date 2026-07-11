"use client";

/**
 * Lightweight animation utilities — CSS-first, no runtime JS cost.
 * 
 * Principles:
 * - Only animate transform + opacity (GPU-accelerated, no layout/paint)
 * - CSS handles timing; JS only toggles visibility classes
 * - respects prefers-reduced-motion (no animation for those users)
 * - IntersectionObserver for scroll reveals (lazy, one-shot)
 */

import { useEffect, useRef, type RefObject } from "react";

// ── Scroll reveal hook ──────────────────────────────────────────────
// Usage: const ref = useScrollReveal(); <div ref={ref} className="reveal">
export function useScrollReveal<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip observer if user prefers reduced motion
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) {
      el.classList.add("revealed");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

// ── Stagger children reveal ─────────────────────────────────────────
// Usage: useStaggerReveal(containerRef, { count: 6, delay: 80 })
export function useStaggerReveal<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  opts: { count?: number; delay?: number } = {}
) {
  const { count = 10, delay = 60 } = opts;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) {
      container.querySelectorAll<HTMLElement>(".reveal-item").forEach((el) => {
        el.classList.add("revealed");
      });
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const children = container.querySelectorAll<HTMLElement>(".reveal-item");
        children.forEach((child, i) => {
          if (i >= count) return;
          child.style.transitionDelay = `${i * delay}ms`;
          child.classList.add("revealed");
        });
        io.unobserve(entry.target);
      },
      { threshold: 0.05 }
    );
    io.observe(container);
    return () => io.disconnect();
  }, [containerRef, count, delay]);
}

// ── Page transition helper ──────────────────────────────────────────
// Add to page root: className={pageTransition()}
export function pageTransition(variant: "fade" | "slide-up" | "scale" = "fade") {
  const map = {
    fade: "page-enter page-enter-fade",
    "slide-up": "page-enter page-enter-slide-up",
    scale: "page-enter page-enter-scale",
  };
  return map[variant];
}
