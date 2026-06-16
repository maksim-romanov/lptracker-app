#include "../helpers/hash.glsl"
#include "../helpers/palette.glsl"

vec3 planetTint(float seed) {
  float t = hash(seed * 23.71);
  if (t < 0.40) return PALETTE_WARM * 0.78;
  if (t < 0.80) return PALETTE_WARM;
  return mix(PALETTE_WARM, PALETTE_WHITE, 0.55);
}

// Per-seed surface pattern — bands, storm spot, or plain.
float planetPattern(vec2 c, float seed) {
  float patternType = hash(seed * 29.13);
  if (patternType < 0.40) {
    float freq = 14.0 + hash(seed * 5.7) * 22.0;
    return 0.78 + 0.22 * sin(c.y * freq + seed * 11.0);
  } else if (patternType < 0.72) {
    float fx = 12.0 + hash(seed * 8.1) * 14.0;
    float fy = 11.0 + hash(seed * 6.3) * 13.0;
    return 0.82 + 0.18 * sin(c.x * fx + seed * 3.1) * cos(c.y * fy + seed * 5.3);
  } else if (patternType < 0.88) {
    vec2 spotPos = vec2(hash(seed * 33.7) - 0.5, hash(seed * 41.1) - 0.5) * 0.20;
    float spot = 1.0 - smoothstep(0.02, 0.07, length(c - spotPos));
    return 1.0 - spot * 0.30;
  }
  return 1.0;
}

vec4 planetLook(vec2 c, float r, float seed) {
  float squash = mix(2.4, 4.6, hash(seed * 3.17));
  float ringRadius = mix(0.34, 0.46, hash(seed * 7.91));
  float ringWidth = mix(0.008, 0.022, hash(seed * 11.7));
  float ringPresence = step(0.42, hash(seed * 19.3));

  float lightAngle = hash(seed * 5.13) * 6.2831;
  vec2 lightDir = vec2(cos(lightAngle), sin(lightAngle));

  float discMask = 1.0 - smoothstep(0.21, 0.25, r);
  float terminator = 1.0 - smoothstep(-0.05, 0.20, dot(c, lightDir));
  float pattern = planetPattern(c, seed);
  float discAlpha = discMask * mix(0.45, 1.0, terminator) * pattern;

  vec2 ringUV = vec2(c.x, c.y * squash);
  float ringDist = abs(length(ringUV) - ringRadius);
  float ringBand = (1.0 - smoothstep(ringWidth * 0.7, ringWidth, ringDist)) * ringPresence;

  float frontMask = step(0.0, c.y);
  float backMask = 1.0 - frontMask;
  float ringBack = ringBand * backMask * (1.0 - discMask) * 0.85;
  float ringFront = ringBand * frontMask;

  float bodyAlpha = max(discAlpha, max(ringBack, ringFront));
  vec3 tint = planetTint(seed);
  vec3 col = mix(tint, vec3(1.0), max(ringBack, ringFront));
  return vec4(col, bodyAlpha);
}
