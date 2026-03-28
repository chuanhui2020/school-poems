import { simplexNoise3D, fbmNoise } from './noise.ts'

export const nightSkyVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const nightSkyFragmentShader = /* glsl */ `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

${simplexNoise3D}
${fbmNoise}

// Hash for star placement
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Stars layer
float stars(vec2 uv, float density) {
  vec2 cell = floor(uv * density);
  vec2 sub = fract(uv * density);
  float h = hash(cell);
  // Only some cells have stars
  if (h > 0.92) {
    vec2 center = vec2(hash(cell + 1.0), hash(cell + 2.0));
    float d = length(sub - center);
    float twinkle = 0.5 + 0.5 * sin(uTime * (1.0 + h * 3.0) + h * 6.28);
    float brightness = smoothstep(0.03, 0.0, d) * twinkle * (0.5 + h * 0.5);
    return brightness;
  }
  return 0.0;
}

// Moon glow
float moon(vec2 uv, vec2 center, float radius) {
  float d = length(uv - center);
  float core = smoothstep(radius, radius * 0.8, d);
  float glow = smoothstep(radius * 6.0, radius * 0.5, d) * 0.15;
  float halo = smoothstep(radius * 3.0, radius, d) * 0.3;
  return core + glow + halo;
}

// Slow clouds
float clouds(vec2 uv, float time) {
  vec3 p = vec3(uv * 2.0, time * 0.02);
  float n = fbm(p, 4);
  return smoothstep(0.0, 0.6, n) * 0.12;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 uvAspect = vec2(uv.x * aspect, uv.y);

  // Deep sky gradient
  vec3 skyTop = vec3(0.008, 0.02, 0.06);
  vec3 skyBottom = vec3(0.02, 0.04, 0.08);
  vec3 col = mix(skyBottom, skyTop, uv.y);

  // Stars — multiple layers for depth
  float s = 0.0;
  s += stars(uvAspect, 80.0);
  s += stars(uvAspect + 100.0, 150.0) * 0.6;
  s += stars(uvAspect + 200.0, 300.0) * 0.3;
  col += vec3(0.7, 0.75, 0.9) * s;

  // Moon — upper right area
  vec2 moonPos = vec2(0.78 * aspect, 0.82);
  float m = moon(uvAspect, moonPos, 0.04);
  vec3 moonColor = vec3(0.85, 0.88, 0.95);
  col += moonColor * m;

  // Subtle moonlight wash
  float moonDist = length(uvAspect - moonPos);
  col += vec3(0.05, 0.06, 0.1) * smoothstep(0.8, 0.0, moonDist);

  // Clouds
  float c = clouds(uvAspect, uTime);
  col = mix(col, vec3(0.15, 0.18, 0.25), c);

  // Vignette
  float vig = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5) * 1.5);
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}
`
