import { type AnimState, advance, displayProgress, initialAnimState, smoothstep01 } from "./anim-state";
import { createParticles, type Particles } from "./particles";
import { createScene, type Scene } from "./scene";
import { createProgressDriver, type ProgressDriver } from "./scroll";
import { Sizes, type ViewportSize } from "./sizes";
import { Time } from "./time";
import { type TuneState, tuneDefaults } from "./tuning/state";

// Read CSS `var(--text)` so the particle tint follows theme swaps.
const readTextColor = (): [number, number, number] | null => {
  const probe = document.createElement("div");
  probe.style.color = "var(--text)";
  probe.style.display = "none";
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  const m = computed.match(/rgba?\(([^)]+)\)/);
  const inner = m?.[1];
  if (!inner) return null;
  const parts = inner.split(",").map((s) => Number.parseFloat(s.trim()));
  const [r, g, b] = parts;
  if (r === undefined || g === undefined || b === undefined) return null;
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return [r / 255, g / 255, b / 255];
};

export class Experience {
  private readonly canvas: HTMLCanvasElement;
  private readonly time = new Time();
  private readonly sizes = new Sizes();
  private readonly scene: Scene;
  private readonly particles: Particles;
  private readonly progress: ProgressDriver;
  private state: AnimState;
  private readonly tune: TuneState = { ...tuneDefaults };
  private teardown: Array<() => void> = [];

  constructor(canvas: HTMLCanvasElement, targets: Float32Array, count: number, tokenAtlas: HTMLImageElement) {
    this.canvas = canvas;
    this.scene = createScene(canvas);
    this.particles = createParticles(this.scene, targets, count, tokenAtlas);
    this.particles.mesh.setParent(this.scene.scene);
    this.progress = createProgressDriver();
    this.state = initialAnimState(performance.now());
  }

  start(): void {
    const rgb = readTextColor();
    if (rgb) this.particles.setColor(rgb);
    this.particles.setTune(this.tune);
    this.applySize(this.sizes.current);
    this.teardown.push(this.sizes.onResize((s) => this.applySize(s)));
    this.teardown.push(
      this.progress.subscribe((p) => {
        this.state = { ...this.state, scrollTarget: p };
      }),
    );
    this.teardown.push(this.time.onTick((now) => this.tick(now)));
    this.sizes.start();
    this.time.start();

    if (__DEV__) {
      void import("./tuning/pane").then(({ mountTuning }) => {
        this.teardown.push(mountTuning(this.tune, this.particles));
      });
    }
  }

  destroy(): void {
    this.time.stop();
    this.sizes.stop();
    for (const t of this.teardown) t();
    this.teardown = [];
    this.progress.destroy();
    this.particles.destroy();
    this.scene.destroy();
  }

  private applySize(s: ViewportSize): void {
    this.scene.resize(s.width, s.height);
    this.particles.setPixelRatio(s.pixelRatio);
    this.particles.setScale(s.scale);
    this.particles.setAspect(s.width / s.height);
  }

  private tick(now: number): void {
    this.state = advance(this.state, this.state.scrollTarget, now);
    const display = displayProgress(this.state, this.tune.entryMs);
    this.particles.setProgress(display);
    this.particles.setTime((now - this.state.startTime) / 1000);
    const cosmosFade = 0.92 - 0.32 * smoothstep01(this.state.smoothedProgress, 0.7, 1);
    this.canvas.style.opacity = String(cosmosFade);
    this.scene.render();
  }
}
