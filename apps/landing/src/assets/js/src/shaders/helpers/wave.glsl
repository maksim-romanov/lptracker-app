#include "hash.glsl"

// Three interfering directional waves with per-particle time lag. Caller
// scales by uTuneWaveAmp and gates with restMask.
vec2 computeWave(vec2 pos, float delay, float time) {
  vec2 waveDir1 = vec2(0.87, 0.50);
  vec2 waveDir2 = vec2(-0.87, 0.50);
  vec2 waveDir3 = vec2(0.50, -0.87);
  float waveLag = hash(delay * 11.3) * 0.30;
  float lagT = time - waveLag;
  float w1 = sin(dot(pos, waveDir1) * 3.4 - lagT * 1.10);
  float w2 = sin(dot(pos, waveDir2) * 2.9 + lagT * 0.85);
  float w3 = sin(dot(pos, waveDir3) * 4.1 - lagT * 1.35);
  return (waveDir1 * w1 + waveDir2 * w2 * 0.75 + waveDir3 * w3 * 0.55) * 0.45;
}
