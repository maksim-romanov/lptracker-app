#include "hash.glsl"

// ~5% pink + ~5% yellow accents that breath near-white most of the time and
// briefly flare. Returns a vIridescence multiplier; gate externally with
// restMask * uTuneIridescence.
vec3 computeAccentTint(float delay, float time) {
  vec3 ACCENT_PINK   = vec3(1.20, 0.10, 0.60);
  vec3 ACCENT_YELLOW = vec3(1.15, 0.92, 0.30);

  float accentRoll = hash(delay * 17.3);
  float isPink = step(accentRoll, 0.05);
  float isYellow = step(0.05, accentRoll) * (1.0 - step(0.10, accentRoll));
  float isAccent = isPink + isYellow;
  vec3 accentTint = isPink * ACCENT_PINK + isYellow * ACCENT_YELLOW;

  float breathPhase = hash(delay * 7.7) * 6.2831;
  float breathSpeed = 0.7 + hash(delay * 19.1) * 0.3;
  float breath = sin(time * 0.8 * breathSpeed + breathPhase) * 0.5 + 0.5;
  breath = pow(breath, 3.0);

  return mix(vec3(1.0), accentTint, breath * isAccent * 0.80);
}
