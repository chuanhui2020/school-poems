import { simplexNoise3D } from './noise'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vInstanceColor;
  varying float vSelected;
  varying float vHovered;

  attribute float aSelected;
  attribute float aHovered;

  void main() {
    #ifdef USE_INSTANCING_COLOR
      vInstanceColor = instanceColor;
    #else
      vInstanceColor = vec3(1.0);
    #endif

    vSelected = aSelected;
    vHovered = aHovered;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
    vWorldPosition = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vInstanceColor;
  varying float vSelected;
  varying float vHovered;

  ${simplexNoise3D}

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);

    // Ink dot: noise-distorted SDF circle
    float dist = length(vNormal.xy);
    float noise = snoise(vWorldPosition * 1.2 + uTime * 0.08) * 0.5 + 0.5;
    float inkEdge = smoothstep(0.9 + noise * 0.1, 0.6, dist);

    // Base ink color: dark with instance color tint
    vec3 inkColor = mix(vec3(0.05, 0.05, 0.08), vInstanceColor * 0.4, noise * 0.6);

    // Cyber glow ring: thin neon outline
    float ring = smoothstep(0.85, 0.88, dist) * smoothstep(0.95, 0.92, dist);
    vec3 glowColor = vec3(0.0, 0.898, 1.0); // #00e5ff
    float glowIntensity = 0.8 + 0.2 * sin(uTime * 1.5);

    // Selected state: cinnabar pulse
    float selectedPulse = vSelected * (0.7 + 0.3 * sin(uTime * 2.0));
    vec3 cinnabar = vec3(1.0, 0.42, 0.21); // #ff6b35
    glowColor = mix(glowColor, cinnabar, selectedPulse);
    ring *= (1.0 + vSelected * 0.5);

    // Hovered state: expand glow
    glowIntensity *= (1.0 + vHovered * 0.4);
    float hoverSpread = vHovered * 0.05;
    float expandedRing = smoothstep(0.80 - hoverSpread, 0.83, dist) * smoothstep(0.98, 0.95, dist);
    ring = max(ring, expandedRing * vHovered);

    vec3 color = inkColor * inkEdge + glowColor * ring * glowIntensity;
    float alpha = max(inkEdge, ring * 0.8);

    gl_FragColor = vec4(color, alpha);
  }
`

export function createInkStarMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  })
}
