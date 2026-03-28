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

    // Geometric polyhedron look: faceted shading
    float facet = abs(dot(normal, viewDir));
    float edgeFactor = 1.0 - facet;

    // Neon outline: bright at edges (Fresnel)
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);

    // Holographic scanlines
    float scanline = sin(vWorldPosition.y * 15.0 + uTime * 2.0) * 0.5 + 0.5;
    scanline = smoothstep(0.4, 0.6, scanline) * 0.3;

    // Base color: dark core with instance color tint
    vec3 coreColor = vInstanceColor * 0.15;
    vec3 outlineColor = vInstanceColor * 1.5 + vec3(0.0, 0.3, 0.4);

    // Selected state: neon red pulse
    float selectedPulse = vSelected * (0.7 + 0.3 * sin(uTime * 3.0));
    vec3 neonRed = vec3(1.0, 0.0, 0.235); // #ff003c
    outlineColor = mix(outlineColor, neonRed * 2.0, selectedPulse);

    // Hovered state: brightness boost + faster scanlines
    float hoverBoost = 1.0 + vHovered * 0.6;
    float hoverScan = vHovered * sin(vWorldPosition.y * 25.0 + uTime * 5.0) * 0.2;

    vec3 color = coreColor + outlineColor * fresnel * hoverBoost;
    color += vInstanceColor * scanline * 0.5;
    color += outlineColor * hoverScan;

    // Data ring for selected nodes
    float ring = smoothstep(0.88, 0.9, edgeFactor) * smoothstep(0.95, 0.93, edgeFactor);
    color += neonRed * ring * vSelected * 1.5;

    float alpha = 0.3 + fresnel * 0.7 + scanline * 0.2;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`

export function createCyberNodeMaterial(): THREE.ShaderMaterial {
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
