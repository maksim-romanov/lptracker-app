#include "../helpers/hash.glsl"

vec4 blackHoleLook(vec2 c, float r, float seed) {
  float tilt = hash(seed * 17.71) * 3.14159;
  mat2 rot = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt));
  vec2 cr = rot * c;
  vec2 cd = vec2(cr.x, cr.y * mix(2.2, 4.0, hash(seed * 31.1)));
  float diskR = length(cd);
  float horizon = smoothstep(0.06, 0.12, r);
  float disk = (1.0 - smoothstep(0.020, 0.045, abs(diskR - 0.20))) * 0.95;
  float halo = (1.0 - smoothstep(0.20, 0.50, r)) * 0.18;
  float total = max(disk, halo) * horizon;
  vec3 col = vec3(1.20, 0.62, 0.32);
  return vec4(col, total);
}
