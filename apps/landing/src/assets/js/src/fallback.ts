export function shouldFallback(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  return false;
}

export function hasWebGL2(): boolean {
  try {
    const probe = document.createElement("canvas");
    return !!probe.getContext("webgl2");
  } catch {
    return false;
  }
}

export function mountStaticFallback(): void {
  const canvas = document.getElementById("hero-canvas");
  canvas?.remove();
  const target = document.querySelector(".hero .inner");
  if (!target) return;
  const img = document.createElement("img");
  img.src = "/assets/img/silhouette.svg";
  img.alt = "";
  img.className = "hero-fallback-img";
  img.setAttribute("aria-hidden", "true");
  target.appendChild(img);
}
