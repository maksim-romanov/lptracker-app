#version 300 es
precision highp float;

#include "helpers/hash.glsl"
#include "helpers/wave.glsl"
#include "helpers/accent.glsl"
#include "helpers/motion.glsl"
#include "kinds"
#include "tokens"

in vec3 position;
in vec3 aSeed;
in vec4 aVariant;
in vec2 aSlotPos;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uProgress;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uScale;
uniform float uCameraZ;
uniform float uAspect;

uniform float uTuneDolly;
uniform float uTuneWordmarkY;
uniform float uTuneSpread;
uniform float uTuneCull;
uniform float uTuneDepthAmp;
uniform float uTuneMotionRamp;
uniform float uTuneDustSpeed;
uniform float uTuneStarSpeed;
uniform float uTuneOrbitSpeed;
uniform float uTuneWaveAmp;
uniform float uTuneShimmer;
uniform float uTuneIridescence;

out float vAlpha;
out float vKind;
out float vSizeScale;
out float vTwinkle;
out float vReveal;
out float vSeed;
out float vShimmer;
out float vTokenIdx;
out vec3 vIridescence;

void main() {
  float delay = aSeed.z;
  vec2 dir = aSeed.xy;
  float sizeScale = aVariant.x;
  float kind = aVariant.y;
  vTokenIdx = aVariant.z;

  float local = clamp((uProgress - delay * 0.45) / 0.65, 0.0, 1.0);
  float t = local * local * (3.0 - 2.0 * local);
  float cosmosReveal = smoothstep(0.0, 0.45, t);

  // Tokens disperse with the cosmos but bloom (full size + disk) only at the
  // tail of the scroll; before that they read as brand-coloured dots.
  float tokenBloom = smoothstep(0.70, 0.98, uProgress);
  float tokenMask = float(IS_TOKEN(kind));
  float effReveal = mix(cosmosReveal, tokenBloom, tokenMask);
  float restMask = 1.0 - effReveal;

  float growthEase = uProgress * uProgress * (3.0 - 2.0 * uProgress);
  float scale = uScale * (1.0 + growthEase * uTuneDolly);
  vec2 base = position.xy * scale + vec2(0.0, uTuneWordmarkY);

  base += computeWave(position.xy, delay, uTime) * uTuneWaveAmp * restMask;
  float bandPos = mod(uTime * 1.3, 10.0) - 5.0;
  float bandDist = position.x - bandPos;
  vShimmer = exp(-bandDist * bandDist * 1.4) * uTuneShimmer * restMask;
  float notToken = 1.0 - tokenMask;
  vec3 accent = computeAccentTint(delay, uTime);
  vIridescence = mix(vec3(1.0), accent, uTuneIridescence * restMask * notToken);

  // Tokens migrate to two horizontal rows (aSlotPos.y = ±0.65) that bracket
  // the CTA text vertically; xExtent capped so the layout fits portrait too.
  float xExtent = min(uAspect * 0.92, 1.45);
  float yExtent = 0.85;
  vec2 slotPos = vec2(aSlotPos.x * xExtent, aSlotPos.y * yExtent);
  float towardSlot = smoothstep(0.05, 0.95, uProgress);
  vec2 tokenBase = mix(position.xy * scale, slotPos, towardSlot) + vec2(0.0, uTuneWordmarkY);
  base = mix(base, tokenBase, tokenMask);

  float hA = hash(delay * 1.0);
  float hB = hash(delay * 5.71);
  float hC = hash(delay * 13.17);
  float phA = delay * 47.0 + position.x * 5.3;
  float phB = delay * 31.0 + position.y * 4.7;

  float clampOverride = kindRestSize(kind, hA);
  float restSize = clampOverride < 0.0 ? sizeScale : clampOverride;
  float effSize = mix(restSize, sizeScale, effReveal);

  vec2 baseMotion = computeKindMotion(
    kind, delay, hA, hB, hC, phA, phB,
    uTime * uTuneDustSpeed, uTime * uTuneStarSpeed, uTime * uTuneOrbitSpeed
  );
  float depthAmp = 0.0015 + effSize * uTuneDepthAmp;
  vec2 jitter = baseMotion * depthAmp * (1.0 + t * uTuneMotionRamp);

  // Spread=0 at rest, so zDir stays neutral and text reads flat. Tokens skip
  // dispersion (they follow tokenBase → slotPos lerp instead).
  float zDir = (hash(delay * 7.11) - 0.5) * 0.8;
  float spread = t * uTuneSpread * kindSpreadMul(kind) * notToken;
  // gridSlot parity alternates token depth (near/far). gridSlot increments
  // along the angular-sorted matching, so spatial neighbours land at opposite
  // depths; hash jitter breaks the strict A-B-A-B pattern.
  float depthBias = mod(aVariant.w, 2.0) * 2.0 - 1.0;
  float depthJitter = (hash(aVariant.w * 19.7) - 0.5) * 0.6;
  float tokenZ = depthBias * 0.85 + depthJitter;
  float zCoord = mix(zDir * spread, tokenZ * towardSlot, tokenMask);
  vec3 pos = vec3(base + dir * spread + jitter, zCoord);

  float specialMask = float(IS_SPECIAL(kind));
  float boost = mix(1.0, 1.25, t * specialMask);

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  // restBoost makes the wordmark chunkier so letters read crisper at rest.
  float restBoost = 1.0 + 0.35 * restMask;
  float rawSize = uSize * uPixelRatio * effSize * boost * restBoost * (uCameraZ / -mvPos.z);
  // Sub-pixel-safe alpha fade: under ~1px the GPU samples flicker as wave drifts.
  float subPixelFade = smoothstep(0.5, 1.4, rawSize);
  gl_PointSize = max(rawSize, 1.0);

  // Bell-curve cull thins mid-scroll clutter. Specials are exempt.
  float cullHash = hash(delay * 3.13);
  float midClutter = sin(uProgress * 3.14159);
  float killBelow = midClutter * uTuneCull;
  float lifeFade = smoothstep(killBelow - 0.04, killBelow + 0.04, cullHash);
  float bgMask = 1.0 - specialMask;
  // Tokens stay fully opaque so the brand colour reads solid across the scroll.
  float alphaBase = mix(1.0, 0.88, t * notToken);
  vAlpha = mix(alphaBase, alphaBase * lifeFade, bgMask) * subPixelFade;

  vKind = kind;
  vSizeScale = sizeScale;
  vTwinkle = 0.92 + 0.08 * sin(uTime * (0.55 + hA * 0.9) + delay * 17.3);
  vReveal = effReveal;
  vSeed = delay;
}
