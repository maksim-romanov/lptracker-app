#include "../helpers/hash.glsl"

float asteroidLook(vec2 c, float seed) {
  float ang = hash(seed * 7.71) * 6.2831;
  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 cr = rot * c;
  float stretch = mix(1.0, 1.8, hash(seed * 11.3));
  vec2 ce = vec2(cr.x * stretch, cr.y);
  float rr = length(ce);
  float theta = atan(cr.y, cr.x);
  float bumpFreq = 4.0 + floor(hash(seed * 13.1) * 4.0);
  float bump = 0.04 * sin(theta * bumpFreq + seed * 5.0);
  float bodyR = 0.30 + bump;
  return 1.0 - smoothstep(bodyR - 0.02, bodyR + 0.01, rr);
}
