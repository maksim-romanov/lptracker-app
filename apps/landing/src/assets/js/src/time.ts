export type Tick = (now: number) => void;

export class Time {
  private subs = new Set<Tick>();
  private rafId = 0;
  private running = false;

  start(): void {
    if (this.running) return;
    this.running = true;
    const loop = (now: number) => {
      if (!this.running) return;
      for (const sub of this.subs) sub(now);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  onTick(cb: Tick): () => void {
    this.subs.add(cb);
    return () => {
      this.subs.delete(cb);
    };
  }
}
