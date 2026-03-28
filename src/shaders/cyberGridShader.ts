import { simplexNoise3D } from './noise'

export const cyberGridVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const cyberGridFragment = /* glsl */ `
uniform float uTime;
uniform vec2 uResolution;

${simplexNoise3D}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // Base color: deep dark blue-black
  vec3 color = vec3(0.02, 0.02, 0.06);

  // Perspective grid floor
  float horizon = 0.35;
  if (uv.y < horizon) {
    // Map to floor plane with perspective
    float depth = (horizon - uv.y) / horizon;
    float perspX = (uv.x - 0.5) / (depth + 0.01);

    // Grid lines
    float gridScale = 8.0;
    float scrollZ = uTime * 0.3;
    float gridX = abs(fract(perspX * gridScale) - 0.5);
    float gridZ = abs(fract(depth * gridScale * 3.0 + scrollZ) - 0.5);

    float lineX = smoothstep(0.02, 0.0, gridX / (depth + 0.1));
    float lineZ = smoothstep(0.02, 0.0, gridZ / (depth + 0.1));
    float grid = max(lineX, lineZ);

    // Fade with distance
    float distFade = 1.0 - smoothstep(0.0, 1.0, depth);
    grid *= distFade * 0.7;

    // Cyan glow for grid
    vec3 gridColor = vec3(0.0, 0.94, 1.0); // #00f0ff
    color += gridColor * grid;

    // Horizon fog glow
    float horizonGlow = smoothstep(0.15, 0.0, abs(uv.y - horizon)) * 0.3;
    color += vec3(0.0, 0.94, 1.0) * horizonGlow;
  }

  // Vertical light beams from floor
  float beamNoise = snoise(vec3(uv.x * 3.0, 0.0, uTime * 0.05));
  float beam = smoothstep(0.85, 1.0, beamNoise);
  beam *= smoothstep(0.7, 0.2, uv.y) * 0.15;
  color += vec3(0.0, 0.94, 1.0) * beam;

  // Upper area: subtle data particles
  float particles = snoise(vec3(uv * 40.0, uTime * 0.08));
  float particleMask = smoothstep(0.5, 1.0, uv.y) * step(0.95, particles) * 0.12;
  color += vec3(0.7, 0.0, 1.0) * particleMask;

  // Subtle overall noise texture
  float grain = snoise(vec3(uv * 200.0, uTime * 0.02)) * 0.015;
  color += vec3(grain);

  gl_FragColor = vec4(color, 1.0);
}
`
