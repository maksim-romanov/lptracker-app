#include "../helpers/hash.glsl"
#include "../helpers/palette.glsl"

// 2-arm log-spiral with per-seed rotation direction + speed. Reads uTime.
vec4 galaxyLook(vec2 c, float seed) {
  float tilt = hash(seed * 11.31) * 3.14159;
  mat2 rot = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt));
  vec2 cr = rot * c;
  float squash = mix(1.0, 2.8, hash(seed * 23.71));
  vec2 ce = vec2(cr.x, cr.y * squash);
  float rrr = length(ce);
  float theta = atan(ce.y, ce.x);

  float rotDir = sign(hash(seed * 41.7) - 0.5);
  float rotSpeed = (0.4 + hash(seed * 19.1) * 0.8) * rotDir;
  float spiralTwist = 5.5;
  float armPhase = (theta + uTime * rotSpeed) * 2.0 - log(max(rrr, 0.05)) * spiralTwist + seed * 3.14;

  float arms = smoothstep(0.0, 0.8, cos(armPhase));
  float armAlpha = arms * smoothstep(0.45, 0.05, rrr);
  float core = 1.0 - smoothstep(0.0, 0.07, rrr);
  float halo = (1.0 - smoothstep(0.0, 0.50, rrr)) * 0.20;
  float total = clamp(core + armAlpha * 0.55 + halo, 0.0, 1.0);
  vec3 col = mix(PALETTE_COOL, PALETTE_WARM, hash(seed * 47.1) * 0.35);
  return vec4(col, total);
}
