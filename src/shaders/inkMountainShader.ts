import { simplexNoise3D, fbmNoise } from './noise'

export const inkMountainVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const inkMountainFragment = /* glsl */ `
uniform float uTime;
uniform vec2 uResolution;

${simplexNoise3D}
${fbmNoise}

// Mountain layer: returns alpha for a given y threshold
float mountainLayer(vec2 uv, float offset, float scale, float height) {
  float n = fbm(vec3(uv.x * scale + offset, 0.0, uTime * 0.02), 5);
  float ridge = height + n * 0.15;
  float edge = smoothstep(ridge + 0.02, ridge - 0.01, uv.y);
  // Ink bleed at edges
  float bleed = snoise(vec3(uv.x * 20.0 + offset, uv.y * 20.0, uTime * 0.05));
  edge += bleed * 0.03 * smoothstep(0.05, 0.0, abs(uv.y - ridge));
  return clamp(edge, 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // Base: near-black
  vec3 color = vec3(0.039, 0.039, 0.059); // #0a0a0f

  // Layer 1: far mountains (lightest ink)
  float m1 = mountainLayer(uv, 0.0, 1.5, 0.35);
  color = mix(color, vec3(0.102, 0.102, 0.180), m1 * 0.6); // #1a1a2e

  // Layer 2: mid mountains
  float m2 = mountainLayer(uv, 3.7, 2.0, 0.25);
  color = mix(color, vec3(0.176, 0.176, 0.267), m2 * 0.7); // #2d2d44

  // Layer 3: near mountains (darkest ink)
  float m3 = mountainLayer(uv, 7.3, 2.5, 0.15);
  color = mix(color, vec3(0.290, 0.290, 0.416), m3 * 0.5); // #4a4a6a

  // Bottom fog: low-frequency noise, slowly drifting
  float fog = smoothstep(0.25, 0.0, uv.y);
  float fogNoise = snoise(vec3(uv.x * 2.0, uv.y * 3.0, uTime * 0.03)) * 0.5 + 0.5;
  fog *= fogNoise * 0.4;
  color += vec3(0.15, 0.15, 0.22) * fog;

  // Top: sparse ink dots (very subtle)
  float dots = snoise(vec3(uv * 50.0, uTime * 0.01));
  float dotMask = smoothstep(0.7, 0.0, uv.y) * step(0.92, dots) * 0.15;
  color += vec3(dotMask);

  gl_FragColor = vec4(color, 1.0);
}
`
