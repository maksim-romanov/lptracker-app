import { cappedDpr } from "./device";

export interface ViewportSize {
  width: number;
  height: number;
  pixelRatio: number;
  scale: number;
}

const MIN_SCALE = 0.3;
const MAX_SCALE = 1.6;

// Wordmark fills `widthFactor` of the viewport half-width. Portrait/phone
// aspects taper toward ~0.7 so the word keeps side margins instead of running
// edge-to-edge; landscape ramps to the bold 0.85 full-bleed. MAX_SCALE caps
// vertical size so the word never overflows on ultra-wide screens.
const computeScale = (aspect: number): number => {
  const t = Math.max(0, Math.min(1, (aspect - 0.5) / 0.7));
  const widthFactor = 0.7 + 0.15 * t;
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, aspect * widthFactor));
};

export type SizesListener = (size: ViewportSize) => void;

export class Sizes {
  private subs = new Set<SizesListener>();
  private listener?: () => void;
  current: ViewportSize;

  constructor() {
    this.current = this.measure();
  }

  start(): void {
    if (this.listener) return;
    let lastW = this.current.width;
    let lastH = this.current.height;
    this.listener = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Mobile URL-bar show/hide fires `resize` with only a small height delta.
      // Re-sizing the GL buffer (renderer.setSize + camera.perspective) on each
      // of those mid-scroll is what makes scrolling stutter, so ignore height-
      // only changes below an orientation-sized threshold.
      if (w === lastW && Math.abs(h - lastH) < 150) return;
      lastW = w;
      lastH = h;
      this.current = this.measure();
      for (const sub of this.subs) sub(this.current);
    };
    window.addEventListener("resize", this.listener, { passive: true });
  }

  stop(): void {
    if (!this.listener) return;
    window.removeEventListener("resize", this.listener);
    this.listener = undefined;
  }

  onResize(cb: SizesListener): () => void {
    this.subs.add(cb);
    return () => {
      this.subs.delete(cb);
    };
  }

  private measure(): ViewportSize {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      width,
      height,
      pixelRatio: cappedDpr(),
      scale: computeScale(width / height),
    };
  }
}
