#include "../helpers/hash.glsl"

// Core + halo, plus a four-point spike once sizeScale > 1.6.
float starLook(vec2 c, float r, float sizeScale) {
  float core = 1.0 - smoothstep(0.04, 0.12, r);
  float halo = (1.0 - smoothstep(0.12, 0.5, r)) * 0.40;
  float a = core + halo;
  if (sizeScale > 1.6) {
    float spike = smoothstep(1.6, 3.0, sizeScale) * 0.65;
    float horiz = (1.0 - smoothstep(0.004, 0.022, abs(c.y))) *
                  (1.0 - smoothstep(0.08, 0.5, abs(c.x)));
    float vert = (1.0 - smoothstep(0.004, 0.022, abs(c.x))) *
                 (1.0 - smoothstep(0.08, 0.5, abs(c.y)));
    a += (horiz + vert) * spike;
  }
  return clamp(a, 0.0, 1.0);
}
