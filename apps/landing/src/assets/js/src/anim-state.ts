export interface AnimState {
  startTime: number;
  smoothedProgress: number;
  scrollTarget: number;
  now: number;
}

const SMOOTH_RATE = 18;
// Clamp dt so a tab-switch pause doesn't snap progress on resume.
const MAX_DT = 0.05;

export function initialAnimState(now: number): AnimState {
  return { startTime: now, smoothedProgress: 0, scrollTarget: 0, now };
}

export function advance(prev: AnimState, scrollTarget: number, now: number): AnimState {
  const dt = Math.min(MAX_DT, (now - prev.now) / 1000);
  const k = 1 - Math.exp(-dt * SMOOTH_RATE);
  return {
    startTime: prev.startTime,
    smoothedProgress: prev.smoothedProgress + (scrollTarget - prev.smoothedProgress) * k,
    scrollTarget,
    now,
  };
}

export function displayProgress(state: AnimState, entryMs: number): number {
  const entryT = entryMs > 0 ? Math.min(1, (state.now - state.startTime) / entryMs) : 1;
  const entryRemaining = 1 - entryT;
  const entry = entryRemaining * entryRemaining * entryRemaining;
  return Math.max(entry, state.smoothedProgress);
}

export function smoothstep01(x: number, a: number, b: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
