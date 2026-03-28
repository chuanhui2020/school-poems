import { simplexNoise3D, fbmNoise } from './noise'

export const inkNebulaVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const inkNebulaFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uSaturation;

${simplexNoise3D}
${fbmNoise}

void main() {
  vec2 uv = vUv - 0.5; // center at origin
  float dist = length(uv);

  // Ink blob shape: noise-distorted circle
  float blobNoise = fbm(vec3(uv * 3.0, uTime * 0.08), 4);
  float blob = smoothstep(0.5 + blobNoise * 0.15, 0.1, dist);

  // Inner ink density variation
  float density = fbm(vec3(uv * 5.0, uTime * 0.05 + 10.0), 3) * 0.5 + 0.5;

  // Breathing animation
  float breathe = 0.95 + 0.05 * sin(uTime * 0.3);
  blob *= breathe;

  // Color: desaturated dynasty color on ink base
  vec3 inkBase = vec3(0.08, 0.08, 0.12);
  vec3 tinted = mix(inkBase, uColor * 0.6, uSaturation * density * 0.5);

  float alpha = blob * density * 0.35;
  gl_FragColor = vec4(tinted, alpha);
}
`
