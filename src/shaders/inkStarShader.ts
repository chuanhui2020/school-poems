import { simplexNoise3D } from './noise'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vInstanceColor;
  varying float vSelected;
  varying float vHovered;
  varying float vBrightness;

  attribute float aSelected;
  attribute float aHovered;
  attribute float aBrightness;

  void main() {
    #ifdef USE_INSTANCING_COLOR
      vInstanceColor = instanceColor;
    #else
      vInstanceColor = vec3(1.0);
    #endif

    vSelected = aSelected;
    vHovered = aHovered;
    vBrightness = aBrightness;

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
  varying float vBrightness;

  ${simplexNoise3D}

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);

    float dist = length(vNormal.xy);

    // Bright core: white-hot center fading to dynasty color
    float core = 1.0 - smoothstep(0.0, 0.5, dist);
    core = pow(core, 2.0);
    vec3 coreColor = mix(vInstanceColor * 1.2, vec3(1.0, 1.0, 1.0), core * 0.8);
    coreColor *= vBrightness;

    // Inner glow: soft radial gradient in dynasty color
    float innerGlow = 1.0 - smoothstep(0.0, 0.8, dist);
    innerGlow = pow(innerGlow, 1.5);

    // Outer halo ring
    float ring = smoothstep(0.75, 0.82, dist) * smoothstep(0.95, 0.88, dist);
    float ringPulse = 0.85 + 0.15 * sin(uTime * 2.0 + vWorldPosition.x * 0.1);
    vec3 haloColor = vInstanceColor * 1.5 * ringPulse * vBrightness;

    // Selected state: bright cyan pulse + expanded ring
    float selectedPulse = vSelected * (0.7 + 0.3 * sin(uTime * 3.0));
    vec3 selectColor = vec3(0.2, 0.9, 1.0); // bright cyan
    haloColor = mix(haloColor, selectColor * 2.0, selectedPulse);
    float selectedRing = smoothstep(0.65, 0.72, dist) * smoothstep(0.98, 0.92, dist);
    ring = mix(ring, selectedRing, vSelected);

    // Hovered state: hexagonal scan effect + expanded glow
    float hoverExpand = vHovered * 0.1;
    float hoverRing = smoothstep(0.70 - hoverExpand, 0.78, dist) * smoothstep(0.98, 0.90, dist);
    ring = max(ring, hoverRing * vHovered);
    float hoverBoost = 1.0 + vHovered * 0.6;

    // Outer soft glow (additive bloom feeder)
    float outerGlow = smoothstep(1.0, 0.3, dist) * 0.15 * vBrightness;

    // Compose
    vec3 color = coreColor * core
               + vInstanceColor * innerGlow * 0.6 * vBrightness
               + haloColor * ring * hoverBoost
               + vInstanceColor * outerGlow;

    float alpha = max(core, max(innerGlow * 0.7, max(ring * 0.9, outerGlow)));
    alpha = clamp(alpha, 0.0, 1.0);

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
