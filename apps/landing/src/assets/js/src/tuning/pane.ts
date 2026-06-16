import { Pane } from "tweakpane";

import type { Particles } from "../particles";
import type { TuneState } from "./state";

// Push pane below the fixed nav (z=100, ~3.5rem tall).
const STYLE_ID = "tuning-pane-position";
const ensureStyle = () => {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `.tp-dfwv { top: 4rem; z-index: 1000; }`;
  document.head.appendChild(s);
};

export function mountTuning(state: TuneState, particles: Particles): () => void {
  ensureStyle();
  const pane = new Pane({ title: "Hero tuning" });
  const sync = () => particles.setTune(state);

  const camera = pane.addFolder({ title: "Camera & layout" });
  camera.addBinding(state, "dolly", { min: 0, max: 8, step: 0.1 }).on("change", sync);
  camera.addBinding(state, "wordmarkY", { min: -0.5, max: 0.5, step: 0.01 }).on("change", sync);
  camera.addBinding(state, "pointSize", { min: 0.5, max: 4, step: 0.05 }).on("change", sync);

  const dispersion = pane.addFolder({ title: "Dispersion" });
  dispersion.addBinding(state, "spread", { min: 0, max: 8, step: 0.1 }).on("change", sync);
  dispersion.addBinding(state, "cull", { min: 0, max: 1, step: 0.01 }).on("change", sync);

  const motion = pane.addFolder({ title: "Motion speeds" });
  motion.addBinding(state, "dustSpeed", { min: 0, max: 4, step: 0.05 }).on("change", sync);
  motion.addBinding(state, "starSpeed", { min: 0, max: 4, step: 0.05 }).on("change", sync);
  motion.addBinding(state, "orbitSpeed", { min: 0, max: 4, step: 0.05 }).on("change", sync);

  const amplitude = pane.addFolder({ title: "Motion amplitude" });
  amplitude.addBinding(state, "depthAmp", { min: 0, max: 0.02, step: 0.0005 }).on("change", sync);
  amplitude.addBinding(state, "motionRamp", { min: 0, max: 15, step: 0.1 }).on("change", sync);

  const wordmark = pane.addFolder({ title: "Wordmark life" });
  wordmark.addBinding(state, "waveAmp", { min: 0, max: 0.06, step: 0.002 }).on("change", sync);
  wordmark.addBinding(state, "shimmer", { min: 0, max: 1.5, step: 0.02 }).on("change", sync);
  wordmark.addBinding(state, "iridescence", { min: 0, max: 1, step: 0.02 }).on("change", sync);

  const timing = pane.addFolder({ title: "Timing" });
  // Min 100: at 0 the entry curve collapses and progress snaps to scroll.
  timing.addBinding(state, "entryMs", { min: 100, max: 5000, step: 50 });

  return () => pane.dispose();
}
