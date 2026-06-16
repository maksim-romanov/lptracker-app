import { cappedDpr } from "./device";

export interface ViewportSize {
  width: number;
  height: number;
  pixelRatio: number;
  scale: number;
}

const MIN_SCALE = 0.42;
const MAX_SCALE = 1.45;

const computeScale = (aspect: number): number => Math.max(MIN_SCALE, Math.min(MAX_SCALE, aspect * 0.85));

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
    this.listener = () => {
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
