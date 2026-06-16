import { isTouch } from "./device";
import { Experience } from "./experience";
import { hasWebGL2, mountStaticFallback, shouldFallback } from "./fallback";

const idle = (cb: () => void) => {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(cb);
  } else {
    setTimeout(cb, 100);
  }
};

async function boot() {
  if (shouldFallback() || !hasWebGL2()) {
    mountStaticFallback();
    return;
  }

  const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;
  if (!canvas) return;

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error(`image ${src} failed: ${String(e)}`));
      img.src = src;
    });

  let targets: Float32Array;
  let tokenAtlas: HTMLImageElement;
  try {
    const [silhouetteRes, atlasImg] = await Promise.all([
      fetch("/assets/data/silhouette.bin").then((r) => {
        if (!r.ok) throw new Error(`silhouette.bin status ${r.status}`);
        return r.arrayBuffer();
      }),
      loadImage("/assets/img/token-atlas.png"),
    ]);
    targets = new Float32Array(silhouetteRes);
    tokenAtlas = atlasImg;
  } catch (err) {
    console.warn("hero: failed to load assets, falling back", err);
    mountStaticFallback();
    return;
  }

  const touch = isTouch();
  const isPhone = touch && window.innerWidth < 600;
  const budget = isPhone ? 12_000 : touch ? 20_000 : 42_000;
  const maxCount = Math.floor(targets.length / 2);
  const count = Math.min(maxCount, budget);

  new Experience(canvas, targets, count, tokenAtlas).start();
}

idle(() => {
  boot().catch((err) => {
    console.error("hero: boot failed", err);
    mountStaticFallback();
  });
});
