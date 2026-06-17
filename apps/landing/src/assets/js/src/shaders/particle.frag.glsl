#version 300 es
precision highp float;

#include "helpers/hash.glsl"
#include "helpers/glow.glsl"
#include "helpers/palette.glsl"
#include "kinds"

in float vAlpha;
in float vKind;
in float vSizeScale;
in float vTwinkle;
in float vReveal;
in float vSeed;
in float vShimmer;
in float vTokenIdx;
in float vTokenSat;
in vec3 vIridescence;
uniform vec3 uColor;
uniform float uTime;
out vec4 outColor;

#include "looks/star.glsl"
#include "looks/planet.glsl"
#include "looks/asteroid.glsl"
#include "looks/galaxy.glsl"
#include "looks/spaceship.glsl"
#include "looks/black-hole.glsl"
#include "looks/token.glsl"

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);

  vec3 color = uColor;
  float alpha;

  if (IS_DUST(vKind)) {
    alpha = 1.0 - smoothstep(0.32, 0.5, r);
    color = mix(uColor, uColor * PALETTE_COOL, vReveal * 0.30);
  } else if (IS_STAR(vKind)) {
    float starHue = hash(vSeed * 13.7);
    vec3 starTint = mix(PALETTE_COOL, PALETTE_WHITE, starHue);
    float brightness = smoothstep(1.8, 3.2, vSizeScale);
    float glow = softGlow(r, 0.14, 0.5, 0.22) * brightness;
    color = mix(uColor, uColor * starTint, 0.45);
    alpha = (starLook(c, r, vSizeScale) + glow) * vTwinkle;
  } else if (IS_PLANET(vKind)) {
    float asStar = starLook(c, r, 2.4) * vTwinkle;
    vec4 p = planetLook(c, r, vSeed);
    float glow = softGlow(r, 0.25, 0.5, 0.12) * vReveal;
    vec3 baseColor = mix(uColor, uColor * p.rgb, vReveal * 0.85);
    color = mix(baseColor, uColor * p.rgb, glow * 0.6);
    alpha = mix(asStar, p.a + glow, vReveal);
  } else if (IS_ASTEROID(vKind)) {
    float asStar = starLook(c, r, vSizeScale) * vTwinkle;
    float asRock = asteroidLook(c, vSeed);
    vec3 rockTint = mix(PALETTE_COOL, PALETTE_WARM, 0.30) * mix(0.75, 0.95, hash(vSeed * 5.31));
    color = mix(uColor, uColor * rockTint, vReveal * 0.55);
    alpha = mix(asStar, asRock, vReveal);
  } else if (IS_GALAXY(vKind)) {
    float asStar = starLook(c, r, 2.4) * vTwinkle;
    vec4 g = galaxyLook(c, vSeed);
    float glow = softGlow(r, 0.32, 0.5, 0.18) * vReveal;
    vec3 baseColor = mix(uColor, uColor * g.rgb, vReveal * 0.70);
    color = mix(baseColor, uColor * g.rgb, glow * 0.7);
    alpha = mix(asStar, g.a + glow, vReveal);
  } else if (IS_SPACESHIP(vKind)) {
    float asStar = starLook(c, r, vSizeScale) * vTwinkle;
    vec4 ship = spaceshipLook(c, vSeed);
    color = mix(uColor, uColor * ship.rgb, vReveal * 0.90);
    alpha = mix(asStar, ship.a, vReveal);
  } else if (IS_TOKEN(vKind)) {
    // Rest look = crisp filled disk (not a star with spikes), so the brand
    // colour reads opaque before vReveal blooms in the coin disk + logo.
    vec3 brand = tokenColor(vTokenIdx);
    // Near-white at the very start (vTokenSat→0) so token dots blend into the
    // white wordmark, ramping to full brand colour as the animation opens.
    vec3 restColor = mix(uColor, brand, vTokenSat);
    float restDisk = (1.0 - smoothstep(0.30, 0.44, r)) * (0.94 + 0.06 * vTwinkle);
    vec4 tok = tokenLook(c, r, vTokenIdx);
    float glow = softGlow(r, 0.18, 0.5, 0.25) * vReveal;
    color = mix(restColor, tok.rgb, vReveal);
    alpha = mix(restDisk, tok.a + glow, vReveal);
  } else {
    float asStar = starLook(c, r, 2.4) * vTwinkle;
    vec4 hole = blackHoleLook(c, r, vSeed);
    float glow = softGlow(r, 0.18, 0.5, 0.30) * vReveal;
    vec3 baseColor = mix(uColor, uColor * hole.rgb, vReveal * 0.85);
    color = mix(baseColor, uColor * PALETTE_WARM, glow * 0.65);
    alpha = mix(asStar, hole.a + glow, vReveal);
  }

  vec3 tinted = color * vIridescence;
  vec3 shimmered = tinted + vec3(0.40) * vShimmer;
  float shimmerAlpha = clamp(alpha + vShimmer * 0.20, 0.0, 1.0);
  // ±4% scene heartbeat.
  float heartbeat = 0.96 + 0.04 * sin(uTime * 0.55);
  outColor = vec4(shimmered * heartbeat, shimmerAlpha * vAlpha);
}
