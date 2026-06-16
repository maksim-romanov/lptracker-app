import { Color, Geometry, Mesh, Program, Texture } from "ogl";

import { cappedDpr } from "./device";
import { KINDS, pickKindAndSize, pickTokenSlots, TOKEN_SLOT_POSITIONS, tokenSizeScale } from "./kinds";
import { CAMERA_Z, type Scene } from "./scene";
import fragmentShader from "./shaders/particle.frag.glsl";
import vertexShader from "./shaders/particle.vert.glsl";
import { type TuneState, tuneDefaults } from "./tuning/state";

export type Particles = {
  mesh: Mesh;
  setProgress: (p: number) => void;
  setTime: (t: number) => void;
  setColor: (rgb: [number, number, number]) => void;
  setPixelRatio: (r: number) => void;
  setScale: (s: number) => void;
  setAspect: (a: number) => void;
  setTune: (state: TuneState) => void;
  destroy: () => void;
};

export function createParticles(scene: Scene, targets: Float32Array, count: number, tokenAtlas: HTMLImageElement): Particles {
  const gl = scene.renderer.gl;

  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);
  // aVariant: (sizeScale, kind, tokenIndex, gridIndex).
  const variants = new Float32Array(count * 4);
  // aSlotPos: token's final-screen target in normalised [-1, 1]². Unused for
  // non-token particles.
  const slotPositions = new Float32Array(count * 2);

  const tokenSlots = pickTokenSlots(count, Math.random);

  // Tokens are written LAST so render-order puts them on top (depth test off).
  let outIdx = 0;
  let gridSlot = 0;
  const writeParticle = (
    sourceIdx: number,
    sizeScale: number,
    kind: number,
    tokenIndex: number,
    gridIndex: number,
    slotX: number,
    slotY: number,
  ) => {
    positions[outIdx * 3] = targets[sourceIdx * 2] ?? 0;
    positions[outIdx * 3 + 1] = targets[sourceIdx * 2 + 1] ?? 0;
    positions[outIdx * 3 + 2] = 0;
    const angle = Math.random() * Math.PI * 2;
    const length = 0.5 + Math.random() * 0.7;
    seeds[outIdx * 3] = Math.cos(angle) * length;
    seeds[outIdx * 3 + 1] = Math.sin(angle) * length;
    seeds[outIdx * 3 + 2] = Math.random();
    variants[outIdx * 4] = sizeScale;
    variants[outIdx * 4 + 1] = kind;
    variants[outIdx * 4 + 2] = tokenIndex;
    variants[outIdx * 4 + 3] = gridIndex;
    slotPositions[outIdx * 2] = slotX;
    slotPositions[outIdx * 2 + 1] = slotY;
    outIdx++;
  };

  for (let i = 0; i < count; i++) {
    if (tokenSlots.has(i)) continue;
    const { kind, sizeScale, tokenIndex } = pickKindAndSize(Math.random);
    writeParticle(i, sizeScale, kind, tokenIndex, 0, 0, 0);
  }

  // Token migration trajectories must not cross. Anchor sits below both the
  // source silhouette and the target slots; matching silhouettes ↔ slots by
  // angle-from-anchor gives a provably non-crossing planar matching.
  const ANCHOR_Y = -2.0;
  const angleFromAnchor = (x: number, y: number) => Math.atan2(y - ANCHOR_Y, x);

  const tokenSpawns: { sourceIdx: number; tokenIndex: number; angle: number }[] = [];
  for (let i = 0; i < count; i++) {
    const reserved = tokenSlots.get(i);
    if (reserved === undefined) continue;
    const sx = targets[i * 2] ?? 0;
    const sy = targets[i * 2 + 1] ?? 0;
    tokenSpawns.push({ sourceIdx: i, tokenIndex: reserved, angle: angleFromAnchor(sx, sy) });
  }
  tokenSpawns.sort((a, b) => a.angle - b.angle);

  const sortedSlots = TOKEN_SLOT_POSITIONS.map((pos) => ({
    pos,
    angle: angleFromAnchor(pos[0], pos[1]),
  })).sort((a, b) => a.angle - b.angle);

  for (let n = 0; n < tokenSpawns.length; n++) {
    const tk = tokenSpawns[n];
    if (!tk) continue;
    const slot = sortedSlots[n]?.pos ?? [0, 0];
    writeParticle(tk.sourceIdx, tokenSizeScale(Math.random), KINDS.TOKEN.id, tk.tokenIndex, gridSlot, slot[0], slot[1]);
    gridSlot++;
  }

  const geometry = new Geometry(gl, {
    position: { size: 3, data: positions },
    aSeed: { size: 3, data: seeds },
    aVariant: { size: 4, data: variants },
    aSlotPos: { size: 2, data: slotPositions },
  });

  const atlasTexture = new Texture(gl, {
    image: tokenAtlas,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
    // OGL flips Y on HTMLImage uploads by default; keep it raw so cell math
    // can treat the PNG as top-left origin.
    flipY: false,
  });

  const uniforms = {
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: tuneDefaults.pointSize },
    uPixelRatio: { value: cappedDpr() },
    uScale: { value: 1.0 },
    uCameraZ: { value: CAMERA_Z },
    uColor: { value: new Color(1, 1, 1) },
    uAspect: { value: 1.0 },
    uTokenAtlas: { value: atlasTexture },
    uTuneDolly: { value: tuneDefaults.dolly },
    uTuneWordmarkY: { value: tuneDefaults.wordmarkY },
    uTuneSpread: { value: tuneDefaults.spread },
    uTuneCull: { value: tuneDefaults.cull },
    uTuneDepthAmp: { value: tuneDefaults.depthAmp },
    uTuneMotionRamp: { value: tuneDefaults.motionRamp },
    uTuneDustSpeed: { value: tuneDefaults.dustSpeed },
    uTuneStarSpeed: { value: tuneDefaults.starSpeed },
    uTuneOrbitSpeed: { value: tuneDefaults.orbitSpeed },
    uTuneWaveAmp: { value: tuneDefaults.waveAmp },
    uTuneShimmer: { value: tuneDefaults.shimmer },
    uTuneIridescence: { value: tuneDefaults.iridescence },
  };

  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new Mesh(gl, { geometry, program, mode: gl.POINTS });

  return {
    mesh,
    setProgress: (p) => {
      uniforms.uProgress.value = p;
    },
    setTime: (t) => {
      uniforms.uTime.value = t;
    },
    setColor: ([r, g, b]) => uniforms.uColor.value.set(r, g, b),
    setPixelRatio: (r) => {
      uniforms.uPixelRatio.value = r;
    },
    setScale: (s) => {
      uniforms.uScale.value = s;
    },
    setAspect: (a) => {
      uniforms.uAspect.value = a;
    },
    setTune: (s) => {
      uniforms.uSize.value = s.pointSize;
      uniforms.uTuneDolly.value = s.dolly;
      uniforms.uTuneWordmarkY.value = s.wordmarkY;
      uniforms.uTuneSpread.value = s.spread;
      uniforms.uTuneCull.value = s.cull;
      uniforms.uTuneDepthAmp.value = s.depthAmp;
      uniforms.uTuneMotionRamp.value = s.motionRamp;
      uniforms.uTuneDustSpeed.value = s.dustSpeed;
      uniforms.uTuneStarSpeed.value = s.starSpeed;
      uniforms.uTuneOrbitSpeed.value = s.orbitSpeed;
      uniforms.uTuneWaveAmp.value = s.waveAmp;
      uniforms.uTuneShimmer.value = s.shimmer;
      uniforms.uTuneIridescence.value = s.iridescence;
    },
    destroy: () => {
      geometry.remove();
      program.remove();
    },
  };
}
