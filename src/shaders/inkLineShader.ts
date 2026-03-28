import { simplexNoise3D } from './noise'

export const inkLineVertex = /* glsl */ `
attribute float aProgress;
varying float vProgress;
varying vec2 vUv;

void main() {
  vProgress = aProgress;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const inkLineFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;

varying float vProgress;
varying vec2 vUv;

${simplexNoise3D}

void main() {
  // Brush stroke width variation: thick in middle, thin at ends
  float widthMask = sin(vProgress * 3.14159);

  // Dry brush / flying white effect: noise-driven alpha holes
  float dryBrush = snoise(vec3(vProgress * 15.0, vUv.y * 5.0, uTime * 0.1));
  float alpha = smoothstep(-0.3, 0.2, dryBrush);

  // Edge irregularity: ink bleed
  float edgeNoise = snoise(vec3(vProgress * 20.0, vUv.y * 10.0, 0.0));
  float edgeMask = smoothstep(0.5 + edgeNoise * 0.1, 0.3, abs(vUv.y - 0.5));

  // Ink color: mostly dark with subtle hue
  vec3 inkColor = mix(vec3(0.08, 0.08, 0.12), uColor * 0.3, 0.3);

  float finalAlpha = alpha * edgeMask * widthMask * uOpacity;
  gl_FragColor = vec4(inkColor, finalAlpha);
}
`
