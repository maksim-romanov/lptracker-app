#include "../helpers/hash.glsl"
#include "../helpers/palette.glsl"

vec4 spaceshipLook(vec2 c, float seed) {
  float ang = hash(seed * 9.13) * 6.2831;
  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 cr = rot * c;
  float body = (1.0 - smoothstep(0.010, 0.022, abs(cr.y))) *
               (1.0 - smoothstep(0.12, 0.18, abs(cr.x)));
  float engine = 1.0 - smoothstep(0.010, 0.045, length(cr - vec2(-0.18, 0.0)));
  float nose = 1.0 - smoothstep(0.005, 0.022, length(cr - vec2(0.16, 0.0)));
  float bodyAlpha = clamp(body + nose * 0.85, 0.0, 1.0);
  float total = max(bodyAlpha, engine);
  vec3 col = mix(PALETTE_WHITE, PALETTE_WARM, engine * 0.85);
  return vec4(col, total);
}
