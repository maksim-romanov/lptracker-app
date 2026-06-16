export const MAX_DPR = 1.5;

export const isTouch = (): boolean => "ontouchstart" in window || navigator.maxTouchPoints > 0;

export const cappedDpr = (): number => Math.min(window.devicePixelRatio, MAX_DPR);
