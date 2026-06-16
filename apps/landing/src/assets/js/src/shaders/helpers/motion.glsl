#include "hash.glsl"
#include "kinds"

// dustT/starT/orbitT are pre-scaled uTime values; hashes + phases come from
// the host shader, which reuses them for size + cull math.
vec2 computeKindMotion(
  float kind,
  float delay,
  float hA, float hB, float hC,
  float phA, float phB,
  float dustT, float starT, float orbitT
) {
  vec2 dustMotion = vec2(
    sin(dustT * (0.20 + hA * 1.10) + phA),
    cos(dustT * (0.18 + hB * 1.30) + phB)
  );
  vec2 starMotion = vec2(
    sin(starT * (0.05 + hA * 0.18) + phA * 0.5),
    cos(starT * (0.04 + hB * 0.18) + phB * 0.5)
  );
  float orbitSpeed = 0.04 + hC * 0.10;
  float orbitPhase = hA * 6.2831;
  vec2 orbitMotion = vec2(
    cos(orbitT * orbitSpeed + orbitPhase),
    sin(orbitT * orbitSpeed + orbitPhase)
  );

  float wobbleAngle = delay * 6.2831;
  mat2 wobble = mat2(cos(wobbleAngle), -sin(wobbleAngle), sin(wobbleAngle), cos(wobbleAngle));

  if (IS_MOTION_BROWNIAN(kind)) return wobble * dustMotion;
  if (IS_MOTION_DRIFT(kind))    return wobble * starMotion;
  return orbitMotion;
}
