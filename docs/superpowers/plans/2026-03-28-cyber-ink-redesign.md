# Cyber Ink Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the poetry metaverse from cosmic/space theme to cyber ink-wash (赛博水墨) style — all visuals pure GLSL, zero texture dependencies.

**Architecture:** Bottom-up — shared GLSL noise library first, then shaders, then 3D components, then UI, then interaction polish. Each task produces a buildable, visually verifiable result.

**Tech Stack:** React Three Fiber, Three.js custom GLSL shaders, Tailwind CSS v4, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-28-cyber-ink-redesign.md`

---

## File Structure

### New Files
- `src/shaders/noise.ts` — shared GLSL noise functions (simplex, fbm)
- `src/shaders/inkMountainShader.ts` — background mountain silhouettes + fog
- `src/shaders/inkNebulaShader.ts` — dynasty ink-wash billboard material
- `src/shaders/inkStarShader.ts` — author node ink + neon glow (replaces starMaterial.ts)
- `src/shaders/inkLineShader.ts` — relationship line brush-stroke material
- `src/components/InkBackground.tsx` — replaces StarfieldBackground.tsx
- `src/components/HoverCard.tsx` — hover tooltip card for author preview

### Modified Files
- `src/index.css` — new color system, animations, utility classes
- `src/components/DynastyNebulaField.tsx` — rewrite to billboard quads
- `src/components/AuthorStarField.tsx` — swap shader, keep InstancedMesh
- `src/components/RelationshipCurve3D.tsx` — rewrite to ribbon geometry
- `src/components/PoemOrbit3D.tsx` — ink dot appearance
- `src/components/CameraController.tsx` — easing, damping, hover card
- `src/components/TimelineRail3D.tsx` — brush-stroke axis, stamp markers
- `src/components/Universe3D.tsx` — swap background, update post-processing
- `src/components/HUD.tsx` — vertical title, stamp, ink buttons
- `src/components/SearchOverlay.tsx` — ink-wash search panel
- `src/components/PoemReader.tsx` — scroll layout, vertical text
- `src/components/AuthorPanel.tsx` — ink-wash sidebar
- `src/store/useStore.ts` — add hoveredAuthorTimer field
- `src/App.tsx` — minor wiring changes

### Deleted Files
- `src/shaders/starMaterial.ts` — replaced by inkStarShader.ts
- `src/components/StarfieldBackground.tsx` — replaced by InkBackground.tsx

---

## Task 1: Color System & CSS Foundation

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace CSS theme variables**

Replace the `@theme` block and body styles in `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg-deep: #0a0a0f;
  --color-bg-mid: #1a1a2e;
  --color-bg-card: #2d2d44;
  --color-bg-panel: rgba(10, 10, 15, 0.92);
  --color-text: #e0dcd0;
  --color-text-dim: #6a6a7a;
  --color-text-bright: #f0ece0;
  --color-accent: #00e5ff;
  --color-accent-dim: rgba(0, 229, 255, 0.3);
  --color-cinnabar: #ff6b35;
  --color-cinnabar-dim: rgba(255, 107, 53, 0.3);
  --color-ink-far: #1a1a2e;
  --color-ink-mid: #2d2d44;
  --color-ink-near: #4a4a6a;
  --color-border: rgba(224, 220, 208, 0.06);
  --color-glow: rgba(0, 229, 255, 0.4);

  --font-family-sans: "Inter", "Noto Sans SC", "PingFang SC", system-ui, sans-serif;
}
```

- [ ] **Step 2: Replace body and background styles**

Replace body, `#root`, `body::before`, and `body::after` with ink-wash background:

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font-family-sans);
  background: #0a0a0f;
  color: var(--color-text);
  min-height: 100vh;
  overflow: hidden;
}

#root { width: 100vw; height: 100vh; position: relative; z-index: 2; }

/* Ink wash vignette — replaces starfield */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(10,10,15,0.7) 100%);
  pointer-events: none;
  z-index: 1;
}
```

- [ ] **Step 3: Add ink-wash utility classes and animations**

Replace the glass effect and animations section:

```css
/* Scrollbar */
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(224,220,208,0.1); border-radius: 2px; }

/* Ink stamp button */
.ink-stamp {
  border: 2px solid var(--color-cinnabar);
  color: var(--color-cinnabar);
  background: transparent;
  padding: 0.25rem 0.75rem;
  font-family: 'LXGW WenKai', serif;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}
.ink-stamp:hover {
  box-shadow: 0 0 12px var(--color-cinnabar-dim);
}

/* Ink dot marker */
.ink-dot::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-dim);
  margin-right: 8px;
  transition: transform 0.3s ease;
}
.ink-dot:hover::before {
  transform: scale(1.5);
  background: var(--color-accent);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes inkSpread {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 1; }
}

.animate-slide-in { animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
.animate-ink-spread { animation: inkSpread 0.5s ease-out forwards; }
.animate-breathe { animation: breathe 4s ease-in-out infinite; }
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "style: replace space theme with cyber ink-wash color system"
```

---

## Task 2: Shared GLSL Noise Library

**Files:**
- Create: `src/shaders/noise.ts`

- [ ] **Step 1: Create noise.ts with simplex and fbm functions**

Create `src/shaders/noise.ts`:

```typescript
/**
 * Shared GLSL noise functions — imported as string chunks by other shaders.
 * Contains 3D simplex noise and FBM (fractal Brownian motion).
 */

export const simplexNoise3D = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

export const fbmNoise = /* glsl */ `
float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
`
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/shaders/noise.ts
git commit -m "feat: add shared GLSL noise library (simplex + fbm)"
```

---

## Task 3: Ink Mountain Background Shader & Component

**Files:**
- Create: `src/shaders/inkMountainShader.ts`
- Create: `src/components/InkBackground.tsx`

- [ ] **Step 1: Create inkMountainShader.ts**

Create `src/shaders/inkMountainShader.ts`:

```typescript
import { simplexNoise3D, fbmNoise } from './noise'

export const inkMountainVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const inkMountainFragment = /* glsl */ `
uniform float uTime;
uniform vec2 uResolution;

${simplexNoise3D}
${fbmNoise}

// Mountain layer: returns alpha for a given y threshold
float mountainLayer(vec2 uv, float offset, float scale, float height) {
  float n = fbm(vec3(uv.x * scale + offset, 0.0, uTime * 0.02), 5);
  float ridge = height + n * 0.15;
  float edge = smoothstep(ridge + 0.02, ridge - 0.01, uv.y);
  // Ink bleed at edges
  float bleed = snoise(vec3(uv.x * 20.0 + offset, uv.y * 20.0, uTime * 0.05));
  edge += bleed * 0.03 * smoothstep(0.05, 0.0, abs(uv.y - ridge));
  return clamp(edge, 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // Base: near-black
  vec3 color = vec3(0.039, 0.039, 0.059); // #0a0a0f

  // Layer 1: far mountains (lightest ink)
  float m1 = mountainLayer(uv, 0.0, 1.5, 0.35);
  color = mix(color, vec3(0.102, 0.102, 0.180), m1 * 0.6); // #1a1a2e

  // Layer 2: mid mountains
  float m2 = mountainLayer(uv, 3.7, 2.0, 0.25);
  color = mix(color, vec3(0.176, 0.176, 0.267), m2 * 0.7); // #2d2d44

  // Layer 3: near mountains (darkest ink)
  float m3 = mountainLayer(uv, 7.3, 2.5, 0.15);
  color = mix(color, vec3(0.290, 0.290, 0.416), m3 * 0.5); // #4a4a6a

  // Bottom fog: low-frequency noise, slowly drifting
  float fog = smoothstep(0.25, 0.0, uv.y);
  float fogNoise = snoise(vec3(uv.x * 2.0, uv.y * 3.0, uTime * 0.03)) * 0.5 + 0.5;
  fog *= fogNoise * 0.4;
  color += vec3(0.15, 0.15, 0.22) * fog;

  // Top: sparse ink dots (very subtle)
  float dots = snoise(vec3(uv * 50.0, uTime * 0.01));
  float dotMask = smoothstep(0.7, 0.0, uv.y) * step(0.92, dots) * 0.15;
  color += vec3(dotMask);

  gl_FragColor = vec4(color, 1.0);
}
`
```

- [ ] **Step 2: Create InkBackground.tsx**

Create `src/components/InkBackground.tsx`:

```typescript
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { inkMountainVertex, inkMountainFragment } from '../shaders/inkMountainShader'

export function InkBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={inkMountainVertex}
        fragmentShader={inkMountainFragment}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(size.width, size.height) },
        }}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/shaders/inkMountainShader.ts src/components/InkBackground.tsx
git commit -m "feat: add ink mountain background shader and component"
```

---

## Task 4: Swap Background in Universe3D

**Files:**
- Modify: `src/components/Universe3D.tsx`
- Delete: `src/components/StarfieldBackground.tsx`

- [ ] **Step 1: Replace StarfieldBackground import with InkBackground**

In `src/components/Universe3D.tsx`, replace:

```typescript
import { StarfieldBackground } from './StarfieldBackground'
```

with:

```typescript
import { InkBackground } from './InkBackground'
```

- [ ] **Step 2: Replace StarfieldBackground usage in Scene**

In the Scene component JSX, replace:

```tsx
<StarfieldBackground />
```

with:

```tsx
<InkBackground />
```

- [ ] **Step 3: Update Canvas background color**

In the `Universe3D` component, change the Canvas style:

```tsx
style={{ background: '#0a0a0f' }}
```

- [ ] **Step 4: Adjust post-processing for ink-wash**

Replace the EffectComposer block:

```tsx
<EffectComposer>
  <Bloom
    intensity={0.8}
    luminanceThreshold={0.7}
    luminanceSmoothing={0.3}
    mipmapBlur
  />
  <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  <Vignette eskil={false} offset={0.25} darkness={0.75} />
</EffectComposer>
```

- [ ] **Step 5: Delete StarfieldBackground.tsx**

Delete `src/components/StarfieldBackground.tsx`.

- [ ] **Step 6: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors. No references to StarfieldBackground remain.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: swap starfield background for ink mountain landscape"
```

---

## Task 5: Dynasty Nebula Ink-Wash Billboard Shader

**Files:**
- Create: `src/shaders/inkNebulaShader.ts`
- Modify: `src/components/DynastyNebulaField.tsx`

- [ ] **Step 1: Create inkNebulaShader.ts**

Create `src/shaders/inkNebulaShader.ts`:

```typescript
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
```

- [ ] **Step 2: Rewrite DynastyNebulaField.tsx to billboard quads**

Replace the entire content of `src/components/DynastyNebulaField.tsx`:

```typescript
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Dynasty } from '../types/poem'
import { build3DTimeScale } from '../lib/layout'
import { inkNebulaVertex, inkNebulaFragment } from '../shaders/inkNebulaShader'

interface Props {
  dynasties: Dynasty[]
}

const timeScale = build3DTimeScale()

function DynastyNebula({ dynasty }: { dynasty: Dynasty }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const xMid = (timeScale(dynasty.startYear) + timeScale(dynasty.endYear)) / 2
  const xSpan = Math.abs(timeScale(dynasty.endYear) - timeScale(dynasty.startYear))
  const size = Math.max(xSpan * 0.8, 40)

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  const color = useMemo(() => new THREE.Color(dynasty.color), [dynasty.color])

  return (
    <group position={[xMid, 0, 0]}>
      <Billboard>
        <mesh>
          <planeGeometry args={[size, size * 0.8]} />
          <shaderMaterial
            ref={materialRef}
            vertexShader={inkNebulaVertex}
            fragmentShader={inkNebulaFragment}
            uniforms={{
              uTime: { value: 0 },
              uColor: { value: color },
              uSaturation: { value: 0.7 },
            }}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
      <Billboard>
        <Text
          position={[0, 55, 0]}
          fontSize={8}
          color={dynasty.color}
          anchorX="center"
          anchorY="middle"
          font="/fonts/LXGWWenKai-Subset.ttf"
          fillOpacity={0.85}
        >
          {dynasty.name}
        </Text>
      </Billboard>
    </group>
  )
}

export function DynastyNebulaField({ dynasties }: Props) {
  return (
    <group>
      {dynasties.map((dynasty) => (
        <DynastyNebula key={dynasty.id} dynasty={dynasty} />
      ))}
    </group>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/shaders/inkNebulaShader.ts src/components/DynastyNebulaField.tsx
git commit -m "feat: replace particle nebulas with ink-wash billboard shaders"
```

---

## Task 6: Author Node Ink Star Shader

**Files:**
- Create: `src/shaders/inkStarShader.ts`
- Modify: `src/components/AuthorStarField.tsx`
- Delete: `src/shaders/starMaterial.ts`

- [ ] **Step 1: Create inkStarShader.ts**

Create `src/shaders/inkStarShader.ts`:

```typescript
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
```

- [ ] **Step 2: Update AuthorStarField.tsx to use new shader**

In `src/components/AuthorStarField.tsx`, make these changes:

Replace the import:
```typescript
import { createStarShaderMaterial } from '../shaders/starMaterial'
```
with:
```typescript
import { createInkStarMaterial } from '../shaders/inkStarShader'
```

Replace the material creation:
```typescript
const starMaterial = useMemo(() => createStarShaderMaterial(), [])
```
with:
```typescript
const starMaterial = useMemo(() => createInkStarMaterial(), [])
```

Add selected/hovered attributes after the `useEffect` that sets instance matrices. Add a new `useEffect` after it:

```typescript
// Set up per-instance selected/hovered attributes
const selectedAttr = useMemo(() => new Float32Array(nodes.length), [nodes.length])
const hoveredAttr = useMemo(() => new Float32Array(nodes.length), [nodes.length])

useEffect(() => {
  const mesh = meshRef.current
  if (!mesh) return
  const geo = mesh.geometry
  geo.setAttribute('aSelected', new THREE.InstancedBufferAttribute(selectedAttr, 1))
  geo.setAttribute('aHovered', new THREE.InstancedBufferAttribute(hoveredAttr, 1))
}, [nodes.length, selectedAttr, hoveredAttr])
```

In the `useFrame` callback, update the selected/hovered attributes instead of only scaling:

```typescript
useFrame(({ clock }) => {
  const mesh = meshRef.current
  if (!mesh) return

  const hovIdx = hoveredNodeId ? idToIndex.get(hoveredNodeId) : undefined
  const selIdx = selectedAuthorId ? idToIndex.get(selectedAuthorId) : undefined

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const isHovered = i === hovIdx
    const isSelected = i === selIdx
    const targetScale = isHovered || isSelected ? node.radius * 1.3 : node.radius

    mesh.getMatrixAt(i, _tempMatrix)
    _tempVec.setFromMatrixPosition(_tempMatrix)
    const currentScale = _tempMatrix.elements[0]
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1)
    _tempMatrix.makeScale(newScale, newScale, newScale)
    _tempMatrix.setPosition(_tempVec.x, _tempVec.y, _tempVec.z)
    mesh.setMatrixAt(i, _tempMatrix)

    selectedAttr[i] = isSelected ? 1.0 : 0.0
    hoveredAttr[i] = isHovered ? 1.0 : 0.0
  }

  mesh.instanceMatrix.needsUpdate = true
  const selGeo = mesh.geometry.getAttribute('aSelected') as THREE.InstancedBufferAttribute
  const hovGeo = mesh.geometry.getAttribute('aHovered') as THREE.InstancedBufferAttribute
  if (selGeo) selGeo.needsUpdate = true
  if (hovGeo) hovGeo.needsUpdate = true
  starMaterial.uniforms.uTime.value = clock.getElapsedTime()
})
```

- [ ] **Step 3: Delete starMaterial.ts**

Delete `src/shaders/starMaterial.ts`.

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors. No references to `starMaterial` or `createStarShaderMaterial` remain.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: replace star shader with ink dot + cyber glow author nodes"
```

---

## Task 7: Relationship Curve Ink Ribbon

**Files:**
- Create: `src/shaders/inkLineShader.ts`
- Modify: `src/components/RelationshipCurve3D.tsx`

- [ ] **Step 1: Create inkLineShader.ts**

Create `src/shaders/inkLineShader.ts`:

```typescript
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
```

- [ ] **Step 2: Rewrite RelationshipCurve3D.tsx with ribbon geometry**

Replace the entire content of `src/components/RelationshipCurve3D.tsx`:

```typescript
import { useMemo } from 'react'
import * as THREE from 'three'
import type { RelationshipEdge, AuthorNode } from '../types/nodes'
import { inkLineVertex, inkLineFragment } from '../shaders/inkLineShader'

interface Props {
  edge: RelationshipEdge
  sourceNode: AuthorNode
  targetNode: AuthorNode
  highlighted: boolean
  dimmed: boolean
}

const TYPE_COLORS: Record<string, string> = {
  friendship: '#f0c060',
  teacher_student: '#80c8ff',
  literary_school: '#c080ff',
  family: '#ff9080',
  contemporary: '#80ffb0',
}

const RIBBON_SEGMENTS = 32
const RIBBON_HALF_WIDTH = 0.8

function buildRibbonGeometry(
  start: THREE.Vector3,
  mid: THREE.Vector3,
  end: THREE.Vector3
): { geometry: THREE.BufferGeometry; progressAttr: Float32Array } {
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
  const points = curve.getPoints(RIBBON_SEGMENTS)
  const tangents = points.map((_, i, arr) => {
    if (i === 0) return arr[1].clone().sub(arr[0]).normalize()
    if (i === arr.length - 1) return arr[i].clone().sub(arr[i - 1]).normalize()
    return arr[i + 1].clone().sub(arr[i - 1]).normalize()
  })

  const up = new THREE.Vector3(0, 1, 0)
  const vertices: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const progress: number[] = []

  for (let i = 0; i <= RIBBON_SEGMENTS; i++) {
    const t = i / RIBBON_SEGMENTS
    const p = points[i]
    const tangent = tangents[i]
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize()

    // Width varies: thin at ends, thick in middle
    const widthScale = Math.sin(t * Math.PI)
    const hw = RIBBON_HALF_WIDTH * (0.3 + 0.7 * widthScale)

    const p0 = p.clone().add(normal.clone().multiplyScalar(hw))
    const p1 = p.clone().add(normal.clone().multiplyScalar(-hw))

    vertices.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z)
    uvs.push(t, 0, t, 1)
    progress.push(t, t)

    if (i < RIBBON_SEGMENTS) {
      const base = i * 2
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setAttribute('aProgress', new THREE.Float32BufferAttribute(progress, 1))
  geometry.setIndex(indices)

  return { geometry, progressAttr: new Float32Array(progress) }
}

export function RelationshipCurve3D({ edge, sourceNode, targetNode, highlighted, dimmed }: Props) {
  const color = TYPE_COLORS[edge.type] ?? '#aaaaaa'
  const opacity = dimmed ? 0.05 : highlighted ? 0.6 : 0.15

  const { geometry, material } = useMemo(() => {
    const s = new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z)
    const e = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z)
    const m = s.clone().lerp(e, 0.5)
    m.y += Math.max(10, s.distanceTo(e) * 0.25)

    const { geometry } = buildRibbonGeometry(s, m, e)

    const material = new THREE.ShaderMaterial({
      vertexShader: inkLineVertex,
      fragmentShader: inkLineFragment,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    })

    return { geometry, material }
  }, [sourceNode.x, sourceNode.y, sourceNode.z, targetNode.x, targetNode.y, targetNode.z, color])

  // Update opacity reactively
  useMemo(() => {
    material.uniforms.uOpacity.value = opacity
  }, [material, opacity])

  return <mesh geometry={geometry} material={material} />
}
```

- [ ] **Step 3: Remove QuadraticBezierLine import**

Verify that `@react-three/drei`'s `QuadraticBezierLine` is no longer imported anywhere:

Run: `grep -r "QuadraticBezierLine" src/`
Expected: No matches.

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add src/shaders/inkLineShader.ts src/components/RelationshipCurve3D.tsx
git commit -m "feat: replace bezier lines with ink ribbon brush-stroke curves"
```

---

## Task 8: Poem Orbit Ink Dots

**Files:**
- Modify: `src/components/PoemOrbit3D.tsx`

- [ ] **Step 1: Rewrite PoemOrbit3D with ink dot appearance**

Replace the entire content of `src/components/PoemOrbit3D.tsx`:

```typescript
import { useRef, useMemo, useCallback } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { PoemNode, AuthorNode } from '../types/nodes'
import { useStore } from '../store/useStore'

interface Props {
  poems: PoemNode[]
  author: AuthorNode
  visible: boolean
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

function fibonacciSphere(index: number, total: number, radius: number): THREE.Vector3 {
  const y = 1 - (index / Math.max(total - 1, 1)) * 2
  const r = Math.sqrt(1 - y * y)
  const theta = GOLDEN_ANGLE * index
  return new THREE.Vector3(
    Math.cos(theta) * r * radius,
    y * radius,
    Math.sin(theta) * r * radius
  )
}

// Ink dot colors
const INK_COLOR = '#1a1a2e'
const INK_EMISSIVE = '#2d2d44'
const CINNABAR = '#ff6b35'

export function PoemOrbit3D({ poems, author, visible }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const selectPoem = useStore((s) => s.selectPoem)
  const selectedPoemId = useStore((s) => s.selectedPoemId)

  const orbitRadius = author.radius * 4 + 6

  const positions = useMemo(
    () => poems.map((_, i) => fibonacciSphere(i, poems.length, orbitRadius)),
    [poems, orbitRadius]
  )

  useFrame((_, delta) => {
    if (groupRef.current && visible) {
      groupRef.current.rotation.y += delta * 0.08
      groupRef.current.rotation.x += delta * 0.03
    }
  })

  const handleClick = useCallback(
    (poemId: string) => (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      selectPoem(poemId)
    },
    [selectPoem]
  )

  if (!visible) return null

  return (
    <group ref={groupRef} position={[author.x, author.y, author.z]}>
      {poems.map((poemNode, i) => {
        const pos = positions[i]
        const isSelected = selectedPoemId === poemNode.id
        const dotColor = isSelected ? CINNABAR : INK_COLOR
        const emissive = isSelected ? CINNABAR : INK_EMISSIVE

        return (
          <group key={poemNode.id} position={pos}>
            <mesh onClick={handleClick(poemNode.id)}>
              <sphereGeometry args={[isSelected ? 1.0 : 0.6, 8, 8]} />
              <meshStandardMaterial
                color={dotColor}
                emissive={emissive}
                emissiveIntensity={isSelected ? 0.8 : 0.2}
                roughness={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>

            {isSelected && (
              <Billboard>
                <Text
                  position={[0, 2, 0]}
                  fontSize={1.8}
                  color="#e0dcd0"
                  anchorX="center"
                  anchorY="bottom"
                  font="/fonts/LXGWWenKai-Subset.ttf"
                  maxWidth={20}
                >
                  {poemNode.poem.title}
                </Text>
              </Billboard>
            )}
          </group>
        )
      })}
    </group>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PoemOrbit3D.tsx
git commit -m "feat: restyle poem orbits as ink dots with cinnabar selection"
```

---

## Task 9: Timeline Rail Calligraphy Scroll

**Files:**
- Modify: `src/components/TimelineRail3D.tsx`

- [ ] **Step 1: Rewrite TimelineRail3D with brush-stroke style**

Replace the entire content of `src/components/TimelineRail3D.tsx`:

```typescript
import { useMemo } from 'react'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Dynasty } from '../types/poem'
import { build3DTimeScale } from '../lib/layout'

interface Props {
  dynasties: Dynasty[]
}

const timeScale = build3DTimeScale()
const RAIL_Y = -80
const SEGMENTS = 200
const RAIL_HALF_WIDTH = 0.6

/** Build a ribbon geometry along the X axis with slight width variation for brush feel */
function buildRailRibbon(xMin: number, xMax: number): THREE.BufferGeometry {
  const vertices: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS
    const x = xMin + (xMax - xMin) * t
    // Slight width wobble for hand-drawn feel
    const wobble = Math.sin(t * 40) * 0.15 + Math.sin(t * 17) * 0.1
    const hw = RAIL_HALF_WIDTH * (1.0 + wobble)
    vertices.push(x, hw, 0, x, -hw, 0)

    if (i < SEGMENTS) {
      const base = i * 2
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geo.setIndex(indices)
  return geo
}

/** Build a short vertical tick ribbon */
function buildTickRibbon(height: number): THREE.BufferGeometry {
  const hw = 0.15
  const wobble = 0.03
  const vertices = [
    -hw - wobble, 0, 0,
    hw + wobble, 0, 0,
    -hw, height, 0,
    hw, height, 0,
  ]
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geo.setIndex([0, 1, 2, 1, 3, 2])
  return geo
}

const TICK_HEIGHT = 6
const STAMP_SIZE = 4

export function TimelineRail3D({ dynasties }: Props) {
  const xMin = timeScale(-1100)
  const xMax = timeScale(1912)

  const railGeo = useMemo(() => buildRailRibbon(xMin, xMax), [xMin, xMax])
  const majorTickGeo = useMemo(() => buildTickRibbon(TICK_HEIGHT), [])
  const minorTickGeo = useMemo(() => buildTickRibbon(TICK_HEIGHT * 0.5), [])

  const ticks = useMemo(() => {
    const result: number[] = []
    for (let year = -1000; year <= 1900; year += 100) {
      result.push(year)
    }
    return result
  }, [])

  return (
    <group position={[0, RAIL_Y, 0]}>
      {/* Main rail ribbon */}
      <mesh geometry={railGeo}>
        <meshBasicMaterial color="#4a4a6a" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Century tick marks */}
      {ticks.map((year) => {
        const x = timeScale(year)
        const isMajor = year % 500 === 0
        return (
          <group key={year} position={[x, 0, 0]}>
            <mesh geometry={isMajor ? majorTickGeo : minorTickGeo}>
              <meshBasicMaterial
                color={isMajor ? '#6a6a7a' : '#3a3a4a'}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
            {isMajor && (
              <Billboard>
                <Text
                  position={[0, TICK_HEIGHT + 2, 0]}
                  fontSize={2}
                  color="#6a6a7a"
                  anchorX="center"
                  anchorY="bottom"
                  fillOpacity={0.7}
                >
                  {year < 0 ? `${Math.abs(year)}BC` : `${year}`}
                </Text>
              </Billboard>
            )}
          </group>
        )
      })}

      {/* Dynasty span markers with stamp-style endpoints */}
      {dynasties.map((dynasty) => {
        const x0 = timeScale(dynasty.startYear)
        const x1 = timeScale(dynasty.endYear)
        const xMid = (x0 + x1) / 2
        const spanWidth = Math.abs(x1 - x0)

        return (
          <group key={dynasty.id}>
            {/* Dynasty color bar below rail */}
            <mesh position={[xMid, -3, 0]}>
              <planeGeometry args={[spanWidth, 2]} />
              <meshBasicMaterial color={dynasty.color} transparent opacity={0.25} />
            </mesh>

            {/* Start stamp: red square outline */}
            <mesh position={[x0, -8, 0]}>
              <ringGeometry args={[STAMP_SIZE * 0.35, STAMP_SIZE * 0.45, 4]} />
              <meshBasicMaterial color="#ff6b35" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>

            {/* Dynasty name label */}
            <Billboard position={[xMid, -12, 0]}>
              <Text
                fontSize={2.5}
                color={dynasty.color}
                anchorX="center"
                anchorY="top"
                font="/fonts/LXGWWenKai-Subset.ttf"
                fillOpacity={0.8}
              >
                {dynasty.name}
              </Text>
            </Billboard>
          </group>
        )
      })}
    </group>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/TimelineRail3D.tsx
git commit -m "feat: restyle timeline rail as calligraphy scroll with stamp markers"
```

---

## Task 10: Store — Add HoverCard Timer

**Files:**
- Modify: `src/store/useStore.ts`

- [ ] **Step 1: Add hoveredAuthorTimer to store**

In `src/store/useStore.ts`, add to the `UniverseState` interface:

```typescript
// HoverCard
hoveredAuthorTimer: ReturnType<typeof setTimeout> | null
setHoveredAuthorTimer: (timer: ReturnType<typeof setTimeout> | null) => void
```

Add to the `create` call:

```typescript
hoveredAuthorTimer: null,
setHoveredAuthorTimer: (timer) => set({ hoveredAuthorTimer: timer }),
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/store/useStore.ts
git commit -m "feat: add hoveredAuthorTimer to store for HoverCard delay"
```

---

## Task 11: HoverCard Component & CameraController Update

**Files:**
- Create: `src/components/HoverCard.tsx`
- Modify: `src/components/CameraController.tsx`

- [ ] **Step 1: Create HoverCard.tsx**

Create `src/components/HoverCard.tsx`:

```typescript
import { useStore } from '../store/useStore'
import authors from '../data/authors.json'
import poems from '../data/poems.json'
import dynasties from '../data/dynasties.json'
import type { Author, Poem, Dynasty } from '../types/poem'

export function HoverCard() {
  const hoveredNodeId = useStore((s) => s.hoveredNodeId)

  if (!hoveredNodeId) return null

  const author = (authors as Author[]).find((a) => a.id === hoveredNodeId)
  if (!author) return null

  const dynasty = (dynasties as Dynasty[]).find((d) => d.id === author.dynastyId)
  const topPoems = (poems as Poem[])
    .filter((p) => p.authorId === hoveredNodeId)
    .slice(0, 2)

  return (
    <div
      className="fixed z-50 pointer-events-none animate-fade-in"
      style={{
        top: '50%',
        right: '2rem',
        transform: 'translateY(-50%)',
      }}
    >
      <div
        className="px-4 py-3 rounded-lg max-w-[200px]"
        style={{
          background: 'rgba(10, 10, 15, 0.9)',
          border: '1px solid rgba(224, 220, 208, 0.1)',
        }}
      >
        <p
          className="text-base font-medium"
          style={{ color: '#e0dcd0', fontFamily: "'LXGW WenKai', serif" }}
        >
          {author.name}
        </p>
        <p className="text-xs mt-1" style={{ color: dynasty?.color ?? '#6a6a7a' }}>
          {dynasty?.name}
        </p>
        {topPoems.length > 0 && (
          <div className="mt-2 border-t border-white/5 pt-2">
            {topPoems.map((p) => (
              <p key={p.id} className="text-xs truncate" style={{ color: '#6a6a7a' }}>
                {p.title}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update CameraController with improved damping**

In `src/components/CameraController.tsx`, update the `FLY_SPEED` constant and OrbitControls props:

Replace:
```typescript
const FLY_SPEED = 0.05
```
with:
```typescript
const FLY_SPEED = 0.04
```

Replace the fly-to lerp in `useFrame`:
```typescript
camera.position.lerp(flyTarget.current, FLY_SPEED)
```
with ease-out:
```typescript
// Ease-out: slow down as we approach target
const dist = camera.position.distanceTo(flyTarget.current)
const speed = FLY_SPEED * Math.max(0.3, Math.min(1.0, dist / 50))
camera.position.lerp(flyTarget.current, speed)
```

Update OrbitControls damping:
```tsx
<OrbitControls
  ref={controlsRef}
  enableDamping
  dampingFactor={0.05}
  rotateSpeed={0.4}
  zoomSpeed={0.8}
  minDistance={5}
  maxDistance={800}
/>
```

- [ ] **Step 3: Wire HoverCard into App.tsx**

In `src/App.tsx`, add the import:
```typescript
import { HoverCard } from './components/HoverCard'
```

Add `<HoverCard />` after `<PoemReader />` in the JSX.

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/HoverCard.tsx src/components/CameraController.tsx src/App.tsx
git commit -m "feat: add HoverCard tooltip and improve camera easing"
```

---

## Task 12: HUD — Vertical Title & Stamp Buttons

**Files:**
- Modify: `src/components/HUD.tsx`

- [ ] **Step 1: Rewrite HUD with ink-wash style**

Replace the entire content of `src/components/HUD.tsx`:

```typescript
import { useStore } from '../store/useStore'

export function HUD() {
  const zoomLevel = useStore((s) => s.zoomLevel)
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const selectAuthor = useStore((s) => s.selectAuthor)
  const toggleSearch = useStore((s) => s.toggleSearch)
  const resetZoom = useStore((s) => s.resetZoom)

  const handleReset = () => resetZoom?.()

  return (
    <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex items-start justify-between px-6 py-4">
        {/* Left: vertical title + breadcrumb */}
        <div className="flex items-start gap-4 pointer-events-auto">
          <h1
            className="text-lg cursor-pointer leading-tight"
            style={{
              color: '#e0dcd0',
              fontFamily: "'LXGW WenKai', serif",
              writingMode: 'vertical-rl',
              letterSpacing: '0.15em',
            }}
            onClick={handleReset}
          >
            古诗词网络
          </h1>
          <div
            className="flex flex-col gap-1 text-xs mt-1"
            style={{ color: '#e0dcd0', opacity: 0.4 }}
          >
            <span>{zoomLevel === 'galaxy' ? '全景' : zoomLevel === 'dynasty' ? '朝代' : '诗人'}</span>
            {selectedAuthorId && (
              <span
                className="cursor-pointer hover:opacity-80"
                onClick={() => selectAuthor(null)}
              >
                › {selectedAuthorId}
              </span>
            )}
          </div>
        </div>

        {/* Right: stamp-style buttons */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={toggleSearch}
            className="ink-stamp text-sm"
            style={{ fontFamily: "'LXGW WenKai', serif" }}
          >
            搜索
          </button>
          <button
            onClick={handleReset}
            className="ink-stamp text-sm"
          >
            全景
          </button>
        </div>
      </div>

      {/* Top gradient fade — replaces backdrop-blur */}
      <div
        className="absolute inset-x-0 top-0 h-20 pointer-events-none -z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,15,0.6), transparent)',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/HUD.tsx
git commit -m "feat: restyle HUD with vertical title and stamp buttons"
```

---

## Task 13: SearchOverlay — Right Slide-In Panel

**Files:**
- Modify: `src/components/SearchOverlay.tsx`

- [ ] **Step 1: Rewrite SearchOverlay as slide-in panel**

Replace the entire content of `src/components/SearchOverlay.tsx`:

```typescript
import { useStore } from '../store/useStore'
import { useSearch } from '../hooks/useSearch'
import authors from '../data/authors.json'
import poems from '../data/poems.json'
import type { Author, Poem } from '../types/poem'

interface Props {
  onSelectAuthor: (id: string) => void
  onSelectPoem: (id: string) => void
}

export function SearchOverlay({ onSelectAuthor, onSelectPoem }: Props) {
  const searchOpen = useStore((s) => s.searchOpen)
  const toggleSearch = useStore((s) => s.toggleSearch)
  const searchQuery = useStore((s) => s.searchQuery)
  const setSearchQuery = useStore((s) => s.setSearchQuery)

  const results = useSearch(authors as Author[], poems as Poem[], searchQuery)

  if (!searchOpen) return null

  return (
    <div
      className="fixed inset-0 z-40"
      onClick={toggleSearch}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(10,10,15,0.5)' }} />

      {/* Right slide-in panel */}
      <div
        className="absolute top-0 right-0 h-full w-[360px] max-w-[85vw] animate-slide-in"
        style={{
          background: 'rgba(10, 10, 15, 0.95)',
          borderLeft: '1px solid rgba(224, 220, 208, 0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="p-6">
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索诗人或诗词..."
            className="w-full bg-transparent outline-none pb-2"
            style={{
              color: '#e0dcd0',
              fontSize: '16px',
              fontFamily: "'LXGW WenKai', serif",
              borderBottom: '1px solid rgba(224, 220, 208, 0.15)',
            }}
          />
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-[calc(100vh-100px)] overflow-y-auto px-2">
            {results.map((r) => (
              <li
                key={`${r.type}-${r.id}`}
                className="ink-dot px-4 py-3 cursor-pointer rounded-lg hover:bg-white/5"
                onClick={() => {
                  if (r.type === 'author') onSelectAuthor(r.id)
                  else onSelectPoem(r.id)
                  toggleSearch()
                  setSearchQuery('')
                }}
              >
                <span style={{ color: '#e0dcd0', fontSize: '14px' }}>{r.title}</span>
                <span className="ml-2" style={{ color: '#6a6a7a', fontSize: '12px' }}>
                  {r.type === 'author' ? '诗人' : '诗词'} · {r.subtitle}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchOverlay.tsx
git commit -m "feat: restyle search as right slide-in panel with ink dot markers"
```

---

## Task 14: PoemReader — Vertical Text & Rice Paper

**Files:**
- Modify: `src/components/PoemReader.tsx`

- [ ] **Step 1: Rewrite PoemReader with vertical layout**

Replace the entire content of `src/components/PoemReader.tsx`:

```typescript
import { useStore } from '../store/useStore'
import poems from '../data/poems.json'
import authors from '../data/authors.json'
import dynasties from '../data/dynasties.json'
import type { Poem, Author, Dynasty } from '../types/poem'

export function PoemReader() {
  const selectedPoemId = useStore((s) => s.selectedPoemId)
  const selectPoem = useStore((s) => s.selectPoem)

  if (!selectedPoemId) return null

  const poem = (poems as Poem[]).find((p) => p.id === selectedPoemId)
  if (!poem) return null

  const author = (authors as Author[]).find((a) => a.id === poem.authorId)
  const dynasty = (dynasties as Dynasty[]).find((d) => d.id === poem.dynastyId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(10, 10, 15, 0.85)' }}
      onClick={() => selectPoem(null)}
    >
      <div
        className="max-w-4xl w-full mx-4 p-10 rounded-lg animate-ink-spread"
        style={{
          background: '#e0dcd0',
          color: '#1a1a2e',
          maxHeight: '85vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — horizontal */}
        <div className="text-center mb-6">
          <h2
            className="text-2xl mb-1"
            style={{ fontFamily: "'LXGW WenKai', serif", color: '#1a1a2e' }}
          >
            {poem.title}
          </h2>
          <p style={{ color: dynasty?.color ?? '#4a4a6a', fontSize: '14px' }}>
            [{dynasty?.name}] {author?.name}
          </p>
          {poem.form && (
            <span
              className="inline-block mt-2 px-3 py-0.5 text-xs rounded"
              style={{
                border: '1px solid #4a4a6a',
                color: '#4a4a6a',
              }}
            >
              {poem.form}
            </span>
          )}
        </div>

        {/* Poem text — vertical */}
        <div
          className="mx-auto mb-8 px-6 py-4"
          style={{
            writingMode: 'vertical-rl',
            fontFamily: "'LXGW WenKai', serif",
            fontSize: '20px',
            lineHeight: 2.5,
            color: '#1a1a2e',
            whiteSpace: 'pre-line',
            maxHeight: '50vh',
            overflowX: 'auto',
            textAlign: 'center',
          }}
        >
          {poem.full_text}
        </div>

        {/* Translation & annotation — horizontal columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {poem.translation && (
            <div
              className="p-4 rounded"
              style={{ background: 'rgba(26, 26, 46, 0.05)' }}
            >
              <p className="text-xs mb-2" style={{ color: '#ff6b35' }}>译文</p>
              <p
                style={{
                  color: '#2d2d44',
                  fontSize: '14px',
                  lineHeight: 1.8,
                  fontFamily: "'LXGW WenKai', serif",
                }}
              >
                {poem.translation}
              </p>
            </div>
          )}

          {poem.annotation && (
            <div
              className="p-4 rounded"
              style={{ background: 'rgba(26, 26, 46, 0.05)' }}
            >
              <p className="text-xs mb-2" style={{ color: '#ff6b35' }}>赏析</p>
              <p
                style={{
                  color: '#2d2d44',
                  fontSize: '14px',
                  lineHeight: 1.8,
                  fontFamily: "'LXGW WenKai', serif",
                }}
              >
                {poem.annotation}
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: '#4a4a6a', opacity: 0.5 }}>
          点击空白处关闭
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PoemReader.tsx
git commit -m "feat: restyle PoemReader with vertical text and rice-paper background"
```

---

## Task 15: AuthorPanel — Ink-Wash Sidebar

**Files:**
- Modify: `src/components/AuthorPanel.tsx`

- [ ] **Step 1: Restyle AuthorPanel with ink-wash theme**

Replace the entire content of `src/components/AuthorPanel.tsx`:

```typescript
import { useState, useEffect } from 'react'
import type { Author, Poem } from '../types'

interface AuthorPanelProps {
  author: Author
  poems: Poem[]
  dynastyColor: string
  onClose: () => void
}

export default function AuthorPanel({ author, poems, dynastyColor, onClose }: AuthorPanelProps) {
  const [expandedPoemId, setExpandedPoemId] = useState<string | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="absolute top-0 right-0 h-full w-[420px] max-w-[90vw] z-40 animate-slide-in flex flex-col"
      style={{
        background: 'rgba(10, 10, 15, 0.92)',
        borderLeft: '1px solid rgba(224, 220, 208, 0.06)',
      }}
    >
      {/* Top accent line */}
      <div className="h-[1px] w-full" style={{ background: dynastyColor, boxShadow: `0 0 8px ${dynastyColor}40` }} />

      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(224, 220, 208, 0.06)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: '#e0dcd0', fontFamily: "'LXGW WenKai', serif" }}
            >
              {author.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: '#6a6a7a' }}>
              {author.courtesy_name && <span>字{author.courtesy_name}</span>}
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{ backgroundColor: dynastyColor, color: '#e0dcd0' }}
              >
                {author.dynastyId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xl cursor-pointer p-1"
            style={{ color: '#6a6a7a' }}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Style labels as mini stamps */}
        {author.style_labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {author.style_labels.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 text-xs"
                style={{
                  border: '1px solid var(--color-cinnabar)',
                  color: 'var(--color-cinnabar)',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {author.brief_bio && (
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: '#6a6a7a' }}
          >
            {author.brief_bio}
          </p>
        )}
      </div>

      {/* Poems list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs mb-3" style={{ color: '#6a6a7a' }}>
          收录 {poems.length} 首作品
        </div>

        <div className="space-y-2">
          {poems.map((poem) => {
            const isExpanded = expandedPoemId === poem.id
            return (
              <div
                key={poem.id}
                className="rounded-lg overflow-hidden transition-colors"
                style={{
                  border: '1px solid rgba(224, 220, 208, 0.04)',
                  background: isExpanded ? 'rgba(224, 220, 208, 0.03)' : 'transparent',
                }}
              >
                <button
                  onClick={() => setExpandedPoemId(isExpanded ? null : poem.id)}
                  className="ink-dot w-full text-left px-4 py-3 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span style={{ color: '#e0dcd0' }}>{poem.title}</span>
                    <span className="text-xs ml-2" style={{ color: '#6a6a7a' }}>{poem.form}</span>
                  </div>
                  <span className="text-sm" style={{ color: '#6a6a7a' }}>
                    {isExpanded ? '▾' : '▸'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div
                      className="whitespace-pre-line text-sm leading-relaxed mb-3 pl-3 border-l-2"
                      style={{ borderColor: dynastyColor, color: '#e0dcd0' }}
                    >
                      {poem.full_text}
                    </div>

                    {poem.translation && (
                      <div className="text-xs leading-relaxed mb-2" style={{ color: '#6a6a7a' }}>
                        <span style={{ color: '#ff6b35' }} className="mr-1">译</span>
                        {poem.translation}
                      </div>
                    )}

                    {poem.annotation && (
                      <div className="text-xs leading-relaxed" style={{ color: '#6a6a7a' }}>
                        <span style={{ color: '#ff6b35' }} className="mr-1">注</span>
                        {poem.annotation}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2">
                      {poem.themes.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded text-[10px]"
                          style={{ background: 'rgba(224, 220, 208, 0.05)', color: '#6a6a7a' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {poems.length === 0 && (
          <div className="text-center py-8" style={{ color: '#6a6a7a' }}>
            暂无收录作品
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/AuthorPanel.tsx
git commit -m "feat: restyle AuthorPanel with ink-wash theme and stamp labels"
```

---

## Task 16: Desaturate Dynasty Colors

**Files:**
- Modify: `src/lib/colorScales.ts`

- [ ] **Step 1: Add desaturation to getDynastyColor**

Replace the entire content of `src/lib/colorScales.ts`:

```typescript
import * as THREE from 'three'
import dynasties from '../data/dynasties.json'
import type { Dynasty } from '../types'

const dynastyColorMap = new Map(
  (dynasties as Dynasty[]).map((d) => [d.id, d.color])
)

/** Desaturate a hex color by a factor (0 = full color, 1 = grayscale) */
function desaturate(hex: string, amount: number): string {
  const color = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  color.getHSL(hsl)
  hsl.s *= (1 - amount)
  color.setHSL(hsl.h, hsl.s, hsl.l)
  return '#' + color.getHexString()
}

export function getDynastyColor(dynastyId: string): string {
  const raw = dynastyColorMap.get(dynastyId) ?? '#999'
  return desaturate(raw, 0.3)
}

export function getDynastyColorRaw(dynastyId: string): string {
  return dynastyColorMap.get(dynastyId) ?? '#999'
}

export function getDynastyName(dynastyId: string): string {
  const d = (dynasties as Dynasty[]).find((d) => d.id === dynastyId)
  return d?.name ?? '未知'
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors. Check that `getDynastyColor` is used in `App.tsx` and `getDynastyColorRaw` is available if any component needs the original color.

- [ ] **Step 3: Commit**

```bash
git add src/lib/colorScales.ts
git commit -m "feat: desaturate dynasty colors 30% for ink-wash aesthetic"
```

---

## Task 17: Final Integration & Cleanup

**Files:**
- Modify: `src/components/Universe3D.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Update Universe3D lighting for ink-wash**

In `src/components/Universe3D.tsx`, replace the lighting setup in the Scene component:

```tsx
<ambientLight intensity={0.3} color="#e0dcd0" />
<directionalLight position={[200, 300, 200]} intensity={0.5} color="#e0dcd0" />
<pointLight position={[-300, -100, -200]} intensity={0.2} color="#4a4a6a" />
```

Lower intensities to avoid washing out the ink-wash aesthetic.

- [ ] **Step 2: Clean up unused imports in Universe3D**

Verify that `Universe3D.tsx` no longer imports `StarfieldBackground`. Remove any unused imports that may remain from the old theme.

- [ ] **Step 3: Verify full build**

Run: `npx tsc --noEmit`
Expected: Zero type errors across the entire project.

- [ ] **Step 4: Visual smoke test**

Run: `npm run dev`
Open in browser and verify:
- Ink mountain background renders (dark layered mountains with fog)
- Dynasty nebulas appear as ink blobs with dynasty colors
- Author nodes show ink dot + cyan glow ring
- Relationship curves render as brush-stroke ribbons
- Timeline rail has calligraphy scroll style with stamp markers
- HUD shows vertical title and stamp buttons
- Search opens as right slide-in panel
- PoemReader shows vertical text on rice-paper background
- AuthorPanel has ink-wash styling with stamp labels
- HoverCard appears on author hover
- Post-processing (bloom, vignette) enhances the mood

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete cyber ink-wash redesign — all components restyled"
```
