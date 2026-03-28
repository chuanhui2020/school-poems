import { simplexNoise3D } from './noise'

export const cyberLineVertex = /* glsl */ `
attribute float aProgress;
varying float vProgress;
varying vec2 vUv;

void main() {
  vProgress = aProgress;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const cyberLineFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;

varying float vProgress;
varying vec2 vUv;

${simplexNoise3D}

void main() {
  // Data stream core: constant width, clean edges
  float coreMask = smoothstep(0.5, 0.35, abs(vUv.y - 0.5));

  // Traveling light dots along path
  float dotSpeed = uTime * 1.5;
  float dotPattern = fract(vProgress * 8.0 - dotSpeed);
  float dot = smoothstep(0.1, 0.0, abs(dotPattern - 0.5) - 0.35);
  dot *= coreMask;

  // Secondary dots (opposite direction, dimmer)
  float dot2Pattern = fract(vProgress * 6.0 + dotSpeed * 0.7);
  float dot2 = smoothstep(0.1, 0.0, abs(dot2Pattern - 0.5) - 0.4);
  dot2 *= coreMask * 0.3;

  // Edge glow
  float edgeGlow = smoothstep(0.5, 0.3, abs(vUv.y - 0.5)) * smoothstep(0.2, 0.3, abs(vUv.y - 0.5));

  // Neon color with glow
  vec3 neonColor = uColor * 1.5;
  vec3 coreGlow = vec3(0.0, 0.94, 1.0); // cyan accent

  vec3 color = neonColor * coreMask * 0.2;
  color += neonColor * dot * 1.2;
  color += coreGlow * dot2;
  color += neonColor * edgeGlow * 0.3;

  float alpha = (coreMask * 0.15 + dot * 0.8 + dot2 * 0.3 + edgeGlow * 0.2) * uOpacity;
  gl_FragColor = vec4(color, alpha);
}
`
