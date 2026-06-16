import Lenis from "lenis";

import { isTouch } from "./device";

type ProgressCb = (p: number) => void;

export type ProgressDriver = {
  subscribe: (cb: ProgressCb) => () => void;
  destroy: () => void;
};

export function createProgressDriver(): ProgressDriver {
  const heroEl = document.getElementById("hero");
  const ctaEl = document.getElementById("cta");
  if (!heroEl || !ctaEl) {
    return { subscribe: () => () => {}, destroy: () => {} };
  }

  const subs = new Set<ProgressCb>();
  let heroTop = 0;
  let ctaTop = 0;

  const measure = () => {
    heroTop = heroEl.getBoundingClientRect().top + window.scrollY;
    ctaTop = ctaEl.getBoundingClientRect().top + window.scrollY;
  };

  const compute = () => {
    const range = Math.max(1, ctaTop - heroTop);
    return Math.max(0, Math.min(1, (window.scrollY - heroTop) / range));
  };

  const emit = () => {
    const p = compute();
    for (const cb of subs) cb(p);
  };

  let lenis: Lenis | null = null;
  let rafId = 0;
  let scrollListener: (() => void) | null = null;
  let scrollPending = false;

  if (isTouch()) {
    scrollListener = () => {
      if (scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(() => {
        scrollPending = false;
        emit();
      });
    };
    window.addEventListener("scroll", scrollListener, { passive: true });
  } else {
    lenis = new Lenis({ smoothWheel: true });
    lenis.on("scroll", emit);
    const tick = (time: number) => {
      lenis?.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  const onResize = () => {
    measure();
    emit();
  };

  measure();
  window.addEventListener("resize", onResize, { passive: true });
  // ResizeObserver catches layout shifts (font loads, container resizes) that
  // don't fire window.resize.
  const ro = new ResizeObserver(() => {
    measure();
    emit();
  });
  ro.observe(heroEl);
  ro.observe(ctaEl);

  if (document.fonts?.ready) {
    void document.fonts.ready.then(() => {
      measure();
      emit();
    });
  }

  return {
    subscribe(cb) {
      subs.add(cb);
      cb(compute());
      return () => {
        subs.delete(cb);
      };
    },
    destroy() {
      lenis?.destroy();
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollListener) window.removeEventListener("scroll", scrollListener);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      subs.clear();
    },
  };
}
