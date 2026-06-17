export interface TuneState {
  dolly: number;
  wordmarkY: number;
  pointSize: number;

  spread: number;
  cull: number;

  dustSpeed: number;
  starSpeed: number;
  orbitSpeed: number;

  depthAmp: number;
  motionRamp: number;

  entryMs: number;

  waveAmp: number;
  shimmer: number;
  iridescence: number;
}

export const tuneDefaults: TuneState = {
  dolly: 4.0,
  wordmarkY: 0.18,
  pointSize: 1.6,

  spread: 4.5,
  cull: 0.55,

  dustSpeed: 1.0,
  starSpeed: 1.0,
  orbitSpeed: 1.0,

  depthAmp: 0.0045,
  motionRamp: 5.0,

  entryMs: 1800,

  waveAmp: 0.0,
  shimmer: 0.55,
  iridescence: 0.75,
};
