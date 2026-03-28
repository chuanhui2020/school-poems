import { simplexNoise3D, fbmNoise } from './noise'

export const cyberNebulaVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const cyberNebulaFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uSaturation;

${simplexNoise3D}
${fbmNoise}

// Hexagonal distance
float hexDist(vec2 p) {
  p = abs(p);
  return max(dot(p, normalize(vec2(1.0, 1.73))), p.x);
}

vec4 hexCoords(vec2 uv) {
  vec2 r = vec2(1.0, 1.73);
  vec2 h = r * 0.5;
  vec2 a = mod(uv, r) - h;
  vec2 b = mod(uv - h, r) - h;
  vec2 gv = dot(a, a) < dot(b, b) ? a : b;
  float d = hexDist(gv);
  return vec4(gv, d, 0.0);
}

void main() {
  vec2 uv = vUv - 0.5;
  float dist = length(uv);

  // Hexagonal honeycomb grid
  vec2 hexUv = uv * 8.0;
  vec4 hex = hexCoords(hexUv);
  float hexEdge = smoothstep(0.45, 0.5, hex.z);

  // Neon edge glow on hexagons
  float edgeGlow = smoothstep(0.5, 0.42, hex.z) * smoothstep(0.35, 0.42, hex.z);

  // Radial falloff — fade at edges
  float radialFade = smoothstep(0.5, 0.15, dist);

  // Data flow particles inside cells
  float flow = snoise(vec3(hexUv * 2.0 + uTime * 0.3, uTime * 0.15));
  float dataParticle = smoothstep(0.6, 0.8, flow) * (1.0 - hexEdge);

  // Breathing animation
  float breathe = 0.95 + 0.05 * sin(uTime * 0.4);

  // Color: saturated dynasty color with neon glow
  vec3 neonColor = uColor * (1.0 + uSaturation * 0.5);
  vec3 edgeColor = neonColor * 1.5;
  vec3 cellColor = neonColor * 0.15;
  vec3 particleColor = vec3(0.0, 0.94, 1.0) * 0.6;

  vec3 finalColor = cellColor * (1.0 - hexEdge);
  finalColor += edgeColor * edgeGlow * 0.6;
  finalColor += particleColor * dataParticle * 0.4;

  float alpha = (edgeGlow * 0.4 + dataParticle * 0.2 + (1.0 - hexEdge) * 0.08) * radialFade * breathe;
  gl_FragColor = vec4(finalColor, alpha);
}
`
