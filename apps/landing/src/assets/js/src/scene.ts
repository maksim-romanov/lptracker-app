import { Camera, Renderer, Transform } from "ogl";

import { cappedDpr } from "./device";

// Invariant: tan(FOV/2) = 1/CAMERA_Z — a 2-unit-tall scene at z=0 fills the viewport.
const FOV_DEG = 18;
export const CAMERA_Z = 1 / Math.tan((FOV_DEG / 2) * (Math.PI / 180));

export type Scene = {
  scene: Transform;
  camera: Camera;
  renderer: Renderer;
  resize: (w: number, h: number) => void;
  render: () => void;
  destroy: () => void;
};

export function createScene(canvas: HTMLCanvasElement): Scene {
  const renderer = new Renderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
    dpr: cappedDpr(),
  });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const scene = new Transform();
  const camera = new Camera(gl, { fov: FOV_DEG, aspect: 1, near: 0.1, far: 20 });
  camera.position.z = CAMERA_Z;

  const resize = (w: number, h: number) => {
    renderer.setSize(w, h);
    camera.perspective({ fov: FOV_DEG, aspect: w / h, near: 0.1, far: 20 });
  };

  const render = () => renderer.render({ scene, camera });

  const destroy = () => {
    const ext = gl.getExtension("WEBGL_lose_context");
    ext?.loseContext();
  };

  return { scene, camera, renderer, resize, render, destroy };
}
