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

  // Lenis mediates BOTH wheel and touch so the WebGL hero stays locked to the
  // scroll position. With native touch scrolling the page scrolls on the
  // compositor thread while the canvas renders on rAF, so the two desync and
  // the hero stutters — the exact WebGL/DOM scroll conflict Lenis exists to
  // solve. `syncTouch` can be unstable on iOS<16, which is acceptably rare.
  const lenis = new Lenis({
    smoothWheel: true,
    syncTouch: isTouch(),
    syncTouchLerp: 0.1,
    touchInertiaExponent: 1.7,
  });
  lenis.on("scroll", emit);
  let rafId = 0;
  const tick = (time: number) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

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
      lenis.destroy();
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      subs.clear();
    },
  };
}
