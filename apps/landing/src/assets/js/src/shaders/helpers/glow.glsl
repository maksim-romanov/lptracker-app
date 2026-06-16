// Peaks at `inner`, falls to zero at `outer`. Cheap bloom substitute.
float softGlow(float r, float inner, float outer, float intensity) {
  return (1.0 - smoothstep(inner, outer, r)) * intensity;
}
