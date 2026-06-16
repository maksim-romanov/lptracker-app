#include "tokens"

uniform sampler2D uTokenAtlas;

// Atlas-rendered logo with a resolution-independent circular AA edge applied
// on top. The shader disk is the SOLE boundary (cropped inside the atlas's
// own r=0.5 alpha) — composing both produced mismatched edges.
vec4 tokenLook(vec2 c, float r, float idx) {
  vec2 cellUV = c + 0.5;
  if (cellUV.x < 0.0 || cellUV.x > 1.0 || cellUV.y < 0.0 || cellUV.y > 1.0) {
    return vec4(0.0);
  }
  // Inset ~1.5% so bilinear filtering at cell borders can't bleed the
  // neighbouring atlas cell.
  vec2 safeUV = mix(vec2(0.015), vec2(0.985), cellUV);
  vec2 atlasUV = tokenAtlasUV(idx) + safeUV * vec2(TOKEN_CELL_W, TOKEN_CELL_H);
  vec4 logo = texture(uTokenAtlas, atlasUV);

  float aaWidth = max(fwidth(r) * 1.5, 0.005);
  float disk = 1.0 - smoothstep(0.46 - aaWidth, 0.46, r);

  return vec4(logo.rgb, logo.a * disk);
}
