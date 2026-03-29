import { simplexNoise3D } from './noise'

export const spaceGridVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const spaceGridFragment = /* glsl */ `
uniform float uTime;
uniform vec2 uResolution;

${simplexNoise3D}

// Hash for starfield
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Perspective grid
float grid(vec2 uv, float t) {
  // Transform to perspective view
  float horizon = 0.45;
  float y = uv.y;
  if (y >= horizon) return 0.0;

  float depth = (horizon - y) / horizon;
  depth = pow(depth, 1.5);

  float x = (uv.x - 0.5) / (depth * 0.8 + 0.2);
  float z = 1.0 / (depth + 0.01) + t * 0.5;

  // Grid lines
  float gx = abs(fract(x * 3.0) - 0.5);
  float gz = abs(fract(z * 0.3) - 0.5);

  float lineX = smoothstep(0.02, 0.0, gx) * 0.4;
  float lineZ = smoothstep(0.02, 0.0, gz) * 0.4;

  float g = max(lineX, lineZ);

  // Fade with distance and at edges
  float fadeDist = smoothstep(0.0, 0.3, depth) * smoothstep(1.0, 0.5, depth);
  float fadeEdge = smoothstep(0.5, 0.35, abs(uv.x - 0.5));

  return g * fadeDist * fadeEdge * 0.6;
}

// Starfield layer
float stars(vec2 uv, float scale, float brightness) {
  vec2 cell = floor(uv * scale);
  vec2 f = fract(uv * scale);

  float star = 0.0;
  float h = hash(cell);

  if (h > 0.97) {
    vec2 center = vec2(hash(cell + 1.0), hash(cell + 2.0));
    float d = length(f - center);
    float size = (h - 0.97) * 15.0;
    star = smoothstep(0.05 * size, 0.0, d) * brightness;

    // Twinkle
    float twinkle = sin(uTime * (1.0 + h * 3.0) + h * 6.28) * 0.3 + 0.7;
    star *= twinkle;
  }

  return star;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // Deep space base
  vec3 color = vec3(0.02, 0.02, 0.04);

  // Subtle space fog
  float fog = snoise(vec3(uv * 2.0, uTime * 0.01)) * 0.5 + 0.5;
  color += vec3(0.01, 0.015, 0.03) * fog;

  // Starfield — multiple layers for depth
  float s1 = stars(uv, 200.0, 1.0);
  float s2 = stars(uv + 0.5, 350.0, 0.6);
  float s3 = stars(uv + 0.3, 500.0, 0.3);
  float starTotal = s1 + s2 + s3;
  color += vec3(0.8, 0.85, 1.0) * starTotal;

  // Perspective grid floor
  float g = grid(uv, uTime);
  vec3 gridColor = vec3(0.1, 0.25, 0.35);
  color += gridColor * g;

  // Horizon glow
  float horizonGlow = exp(-pow((uv.y - 0.45) * 8.0, 2.0)) * 0.08;
  color += vec3(0.1, 0.2, 0.3) * horizonGlow;

  gl_FragColor = vec4(color, 1.0);
}
`
