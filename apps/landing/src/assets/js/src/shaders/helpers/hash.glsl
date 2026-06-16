// Deterministic 1D→1D hash, range [0, 1). Classic fract(sin(x) * k).
float hash(float x) {
  return fract(sin(x * 91.345) * 43758.5453);
}
