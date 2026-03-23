# 诗词元宇宙 3D 重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 2D SVG visualization with a 3D immersive experience using React Three Fiber, where poets are glowing stars in a navigable universe organized by dynasty nebulae along a timeline.

**Architecture:** R3F `<Canvas>` replaces `<svg>`, all 3D components live in `src/components/scene/`. HTML overlays (HUD, search, panels) remain unchanged on top. Zustand store interface unchanged — `CameraController` registers `resetZoom` instead of the old `useUniverseZoom`. Layout engine extended with 3D coordinates and new `build3DTimeScale`.

**Tech Stack:** React 19, Three.js, @react-three/fiber, @react-three/drei, Zustand, TypeScript

---

## File Structure

### Files to Delete (replaced by 3D versions)
- `src/components/Universe.tsx`
- `src/components/DynastyNebula.tsx`
- `src/components/AuthorStar.tsx`
- `src/components/RelationshipEdge.tsx`
- `src/components/PoemOrbit.tsx`
- `src/components/TimelineAxis.tsx`
- `src/hooks/useUniverseZoom.ts`
- `src/components/visualizations/shared/useDimensions.ts`

### Files to Modify
- `src/types/nodes.ts` — Add `z: number` to `AuthorNode`
- `src/lib/layout.ts` — Add `build3DTimeScale`, `layoutAuthors3D`, `STYLE_Z_MAP`
- `src/App.tsx` — Replace `<Universe>` with `<Universe3D>`, add ErrorBoundary
- `package.json` — Add three, @react-three/fiber, @react-three/drei, @types/three

### Files to Create
```
src/components/scene/
├── Universe3D.tsx          # R3F Canvas + scene assembly + lighting
├── CameraController.tsx    # OrbitControls + fly-to animation + resetZoom registration
├── StarfieldBackground.tsx # Drei <Stars> particle starfield
├── DynastyNebula3D.tsx     # Dynasty particle ellipsoid clouds
├── AuthorStar3D.tsx        # Author nodes + 3-level LOD
├── RelationshipCurve3D.tsx # Glowing bezier curves + flow animation
├── PoemOrbit3D.tsx         # 3D spherical poem satellites
└── TimelineRail3D.tsx      # 3D timeline axis
src/hooks/
└── useSemanticZoom.ts      # Camera-distance-based zoom level
```

---

## Phase 1: Foundation

### Task 1: Install dependencies and delete old 2D components

**Files:**
- Modify: `package.json`
- Delete: `src/components/Universe.tsx`, `src/components/DynastyNebula.tsx`, `src/components/AuthorStar.tsx`, `src/components/RelationshipEdge.tsx`, `src/components/PoemOrbit.tsx`, `src/components/TimelineAxis.tsx`, `src/hooks/useUniverseZoom.ts`, `src/hooks/useTimelineLayout.ts`, `src/components/visualizations/shared/useDimensions.ts`
- Modify: `src/App.tsx` (stub)

- [ ] **Step 1: Install 3D dependencies**

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

- [ ] **Step 2: Delete old 2D components**

```bash
rm src/components/Universe.tsx
rm src/components/DynastyNebula.tsx
rm src/components/AuthorStar.tsx
rm src/components/RelationshipEdge.tsx
rm src/components/PoemOrbit.tsx
rm src/components/TimelineAxis.tsx
rm src/hooks/useUniverseZoom.ts
rm src/hooks/useTimelineLayout.ts
rm src/components/visualizations/shared/useDimensions.ts
```

- [ ] **Step 3: Stub App.tsx**

Replace `src/App.tsx` with:

```tsx
import { useStore } from './store/useStore'
import { HUD } from './components/HUD'
import { SearchOverlay } from './components/SearchOverlay'
import { PoemReader } from './components/PoemReader'
import AuthorPanel from './components/AuthorPanel'
import authors from './data/authors.json'
import poems from './data/poems.json'
import dynasties from './data/dynasties.json'
import type { Author, Poem, Dynasty } from './types/poem'
import { getDynastyColor } from './lib/colorScales'

export default function App() {
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const selectAuthor = useStore((s) => s.selectAuthor)
  const selectPoem = useStore((s) => s.selectPoem)

  const selectedAuthor = selectedAuthorId
    ? (authors as Author[]).find((a) => a.id === selectedAuthorId) ?? null
    : null
  const authorPoems = selectedAuthorId
    ? (poems as Poem[]).filter((p) => p.authorId === selectedAuthorId)
    : []
  const dynastyColor = selectedAuthorId
    ? getDynastyColor((authors as Author[]).find((a) => a.id === selectedAuthorId)?.dynastyId ?? '')
    : '#888'
  const getDynastyName = (dynastyId: string) =>
    (dynasties as Dynasty[]).find((d) => d.id === dynastyId)?.name ?? dynastyId

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-[var(--color-bg-deep)]">
      {/* Universe3D will go here */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p style={{ color: '#e0d6c8', fontFamily: "'LXGW WenKai', serif" }}>
          3D 重构中...
        </p>
      </div>
      <HUD />
      <SearchOverlay
        onSelectAuthor={(id) => selectAuthor(id)}
        onSelectPoem={(id) => selectPoem(id)}
      />
      <PoemReader />
      {selectedAuthor && (
        <AuthorPanel
          author={{ ...selectedAuthor, dynastyId: getDynastyName(selectedAuthor.dynastyId) }}
          poems={authorPoems}
          dynastyColor={dynastyColor}
          onClose={() => selectAuthor(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: install R3F deps, remove old 2D components, stub App"
```

---

### Task 2: Extend types and layout engine for 3D

**Files:**
- Modify: `src/types/nodes.ts`
- Modify: `src/lib/layout.ts`
- Modify: `src/store/useStore.ts`

- [ ] **Step 1: Add `z` field to `AuthorNode` in `src/types/nodes.ts`**

After the `y: number` line, add:

```ts
  /** Z position (computed from literary style) */
  z: number
```

- [ ] **Step 2: Update existing `layoutAuthors` to include `z: 0` default**

In `src/lib/layout.ts`, in the `layoutAuthors` function, add `z: 0,` to the object pushed to `nodes` (after the `y:` line). This prevents type errors since `AuthorNode` now requires `z`.

- [ ] **Step 3: Add `flyToTarget` to Zustand store**

In `src/store/useStore.ts`, add to the `UniverseState` interface after the `setResetZoom` line:

```ts
  // Camera fly-to (set by AuthorStar3D/search, consumed by CameraController)
  flyToTarget: [number, number, number] | null
  setFlyToTarget: (target: [number, number, number] | null) => void
```

And add to the `create` body after `setResetZoom`:

```ts
  flyToTarget: null,
  setFlyToTarget: (target) => set({ flyToTarget: target }),
```

- [ ] **Step 4: Add 3D layout functions to `src/lib/layout.ts`**

Append to the end of the file:

```ts
/** Style label → Z coordinate mapping */
export const STYLE_Z_MAP: Record<string, number> = {
  '豪放': 8,
  '边塞': 6,
  '现实主义': 3,
  '田园': 0,
  '山水': -2,
  '婉约': -5,
  '花间': -8,
}

/** 3D coordinate constants */
export const WORLD_3D = {
  X_RANGE: [-40, 40] as [number, number],
  Y_RANGE: [-15, 15] as [number, number],
  Z_RANGE: [-10, 10] as [number, number],
} as const

/**
 * Build a 3D-friendly time scale.
 * Maps years to Three.js coordinates [-40, 40].
 */
export function build3DTimeScale() {
  return scaleLinear()
    .domain([-1100, 1912])
    .range(WORLD_3D.X_RANGE)
}

/**
 * Compute Z coordinate from style labels.
 */
function computeStyleZ(styleLabels: string[]): number {
  if (styleLabels.length === 0) return 0
  const values = styleLabels
    .map((s) => STYLE_Z_MAP[s])
    .filter((v) => v !== undefined)
  if (values.length === 0) return 0
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  // Add small jitter to avoid overlap
  return avg + (Math.random() - 0.5) * 2
}

/**
 * Position authors in 3D space.
 * X = birth year, Y = spread within dynasty, Z = literary style.
 */
export function layoutAuthors3D(
  authors: Author[],
  poems: { authorId: string }[],
  timeScale: ReturnType<typeof build3DTimeScale>
): AuthorNode[] {
  const poemCounts = new Map<string, number>()
  for (const p of poems) {
    poemCounts.set(p.authorId, (poemCounts.get(p.authorId) ?? 0) + 1)
  }

  const byDynasty = new Map<string, Author[]>()
  for (const a of authors) {
    const list = byDynasty.get(a.dynastyId) ?? []
    list.push(a)
    byDynasty.set(a.dynastyId, list)
  }

  const nodes: AuthorNode[] = []

  for (const [dynastyId, group] of byDynasty) {
    group.sort((a, b) => (a.birth_year ?? 0) - (b.birth_year ?? 0))

    group.forEach((author, i) => {
      const count = poemCounts.get(author.id) ?? 0
      const radius = Math.max(0.3, Math.min(1.2, 0.3 + count * 0.12))

      const spread = Math.min(20, group.length * 2)
      const yOffset = group.length === 1
        ? 0
        : ((i / (group.length - 1)) - 0.5) * spread

      nodes.push({
        id: author.id,
        type: 'author',
        label: author.name,
        author,
        dynastyId,
        color: getDynastyColor(dynastyId),
        x: timeScale(author.birth_year ?? 0),
        y: yOffset,
        z: computeStyleZ(author.style_labels ?? []),
        poemCount: count,
        radius,
        styleLabels: author.style_labels ?? [],
      })
    })
  }

  return nodes
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS (existing `layoutAuthors` now includes `z: 0`, new `layoutAuthors3D` added alongside)

- [ ] **Step 4: Commit**

```bash
git add src/types/nodes.ts src/lib/layout.ts
git commit -m "feat: extend AuthorNode with z field, add 3D layout engine"
```

---

## Phase 2: Core 3D Scene

### Task 3: Create StarfieldBackground and Universe3D shell

**Files:**
- Create: `src/components/scene/StarfieldBackground.tsx`
- Create: `src/components/scene/Universe3D.tsx`

- [ ] **Step 1: Create `src/components/scene/StarfieldBackground.tsx`**

```tsx
import { Stars } from '@react-three/drei'

export function StarfieldBackground() {
  return (
    <Stars
      radius={200}
      depth={100}
      count={3000}
      factor={4}
      saturation={0}
      fade
      speed={0.5}
    />
  )
}
```

- [ ] **Step 2: Create `src/components/scene/Universe3D.tsx`**

Minimal shell with Canvas, lighting, and starfield:

```tsx
import { Canvas } from '@react-three/fiber'
import { StarfieldBackground } from './StarfieldBackground'

export function Universe3D() {
  return (
    <Canvas
      camera={{ position: [0, 20, 60], fov: 60, near: 0.1, far: 1000 }}
      style={{ position: 'absolute', inset: 0 }}
      fallback={
        <div className="absolute inset-0 flex items-center justify-center">
          <p style={{ color: '#e0d6c8' }}>加载 3D 场景中...</p>
        </div>
      }
    >
      <ambientLight intensity={0.3} />
      <StarfieldBackground />
    </Canvas>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/scene/
git commit -m "feat: add Universe3D shell with starfield background"
```

---

### Task 4: Create CameraController with OrbitControls and fly-to

**Files:**
- Create: `src/components/scene/CameraController.tsx`
- Create: `src/hooks/useSemanticZoom.ts`

- [ ] **Step 1: Create `src/hooks/useSemanticZoom.ts`**

```ts
import { useCallback } from 'react'
import { useStore } from '../store/useStore'
import type { ZoomLevel } from '../types/nodes'

/**
 * Compute semantic zoom level from camera distance.
 * Calibrated for 3D world (80×30×20 units).
 */
function distanceToZoomLevel(distance: number): ZoomLevel {
  if (distance > 80) return 'galaxy'
  if (distance > 30) return 'dynasty'
  return 'poet'
}

export function useSemanticZoom() {
  const setZoomLevel = useStore((s) => s.setZoomLevel)

  const updateZoom = useCallback(
    (cameraDistance: number) => {
      setZoomLevel(distanceToZoomLevel(cameraDistance))
    },
    [setZoomLevel]
  )

  return { updateZoom }
}
```

- [ ] **Step 2: Create `src/components/scene/CameraController.tsx`**

```tsx
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { useSemanticZoom } from '../../hooks/useSemanticZoom'

const INITIAL_POS = new THREE.Vector3(0, 20, 60)
const INITIAL_TARGET = new THREE.Vector3(0, 0, 0)

export function CameraController() {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const setResetZoom = useStore((s) => s.setResetZoom)
  const flyToTarget = useStore((s) => s.flyToTarget)
  const setFlyToTarget = useStore((s) => s.setFlyToTarget)
  const { updateZoom } = useSemanticZoom()

  // Internal fly state
  const flyPos = useRef<THREE.Vector3 | null>(null)
  const flyLookAt = useRef<THREE.Vector3 | null>(null)

  // Register resetZoom in store
  useEffect(() => {
    setResetZoom(() => {
      flyPos.current = INITIAL_POS.clone()
      flyLookAt.current = INITIAL_TARGET.clone()
    })
    return () => setResetZoom(null)
  }, [setResetZoom])

  // React to flyToTarget from store (set by AuthorStar3D or search)
  useEffect(() => {
    if (flyToTarget) {
      const target = new THREE.Vector3(...flyToTarget)
      // Position camera offset from the target
      flyPos.current = target.clone().add(new THREE.Vector3(0, 5, 15))
      flyLookAt.current = target.clone()
      setFlyToTarget(null) // consume the target
    }
  }, [flyToTarget, setFlyToTarget])

  // Animation loop
  useFrame(() => {
    if (flyPos.current) {
      camera.position.lerp(flyPos.current, 0.03)
      if (flyLookAt.current && controlsRef.current) {
        controlsRef.current.target.lerp(flyLookAt.current, 0.03)
      }
      if (camera.position.distanceTo(flyPos.current) < 0.1) {
        flyPos.current = null
        flyLookAt.current = null
      }
    }

    // Update semantic zoom based on camera distance from origin
    updateZoom(camera.position.length())
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={200}
      makeDefault
    />
  )
}
```

- [ ] **Step 3: Update Universe3D to include CameraController**

Add to `src/components/scene/Universe3D.tsx`:

```tsx
import { Canvas } from '@react-three/fiber'
import { StarfieldBackground } from './StarfieldBackground'
import { CameraController } from './CameraController'

export function Universe3D() {
  return (
    <Canvas
      camera={{ position: [0, 20, 60], fov: 60, near: 0.1, far: 1000 }}
      style={{ position: 'absolute', inset: 0 }}
      fallback={
        <div className="absolute inset-0 flex items-center justify-center">
          <p style={{ color: '#e0d6c8' }}>加载 3D 场景中...</p>
        </div>
      }
    >
      <ambientLight intensity={0.3} />
      <CameraController />
      <StarfieldBackground />
    </Canvas>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/scene/ src/hooks/useSemanticZoom.ts
git commit -m "feat: add CameraController with OrbitControls and semantic zoom"
```

---

### Task 5: Create DynastyNebula3D

**Files:**
- Create: `src/components/scene/DynastyNebula3D.tsx`

- [ ] **Step 1: Create `src/components/scene/DynastyNebula3D.tsx`**

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import type { DynastyRegion, ZoomLevel } from '../../types/nodes'
import { getNarrative } from '../../lib/dynastyNarratives'

interface Props {
  region: DynastyRegion
  zoomLevel: ZoomLevel
}

export function DynastyNebula3D({ region, zoomLevel }: Props) {
  const narrative = getNarrative(region.dynasty.id)
  const centerX = (region.x0 + region.x1) / 2
  const width = Math.abs(region.x1 - region.x0)

  // Generate particle positions for the nebula ellipsoid
  const particles = useMemo(() => {
    const count = 200
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Ellipsoid distribution
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.cbrt(Math.random()) // uniform volume distribution
      positions[i * 3] = centerX + r * (width / 2) * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * 8 * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * 6 * Math.cos(phi)
    }
    return positions
  }, [centerX, width])

  const pointsRef = useRef<THREE.Points>(null)

  // Slow rotation
  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02
    }
  })

  const color = new THREE.Color(region.color)

  return (
    <group>
      {/* Particle cloud */}
      <Points ref={pointsRef} positions={particles} stride={3}>
        <PointMaterial
          transparent
          color={color}
          size={0.15}
          sizeAttenuation
          depthWrite={false}
          opacity={0.3}
        />
      </Points>

      {/* Point light at center */}
      <pointLight
        position={[centerX, 0, 0]}
        color={region.color}
        intensity={0.5}
        distance={30}
      />

      {/* Dynasty name billboard */}
      <Billboard position={[centerX, 10, 0]}>
        <Text
          fontSize={zoomLevel === 'galaxy' ? 3 : 1.5}
          color={region.color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.6}
          font="/fonts/LXGWWenKai-Regular.ttf"
        >
          {narrative?.title ?? region.dynasty.name}
        </Text>
      </Billboard>

      {/* Subtitle — visible at dynasty zoom */}
      {zoomLevel === 'dynasty' && narrative && (
        <Billboard position={[centerX, 8, 0]}>
          <Text
            fontSize={0.8}
            color={region.color}
            anchorX="center"
            anchorY="middle"
            fillOpacity={0.4}
            font="/fonts/LXGWWenKai-Regular.ttf"
          >
            {narrative.subtitle}
          </Text>
        </Billboard>
      )}
    </group>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/scene/DynastyNebula3D.tsx
git commit -m "feat: add DynastyNebula3D particle cloud with dynasty labels"
```

---

### Task 6: Create AuthorStar3D with LOD

**Files:**
- Create: `src/components/scene/AuthorStar3D.tsx`

- [ ] **Step 1: Create `src/components/scene/AuthorStar3D.tsx`**

```tsx
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text, Detailed } from '@react-three/drei'
import * as THREE from 'three'
import type { AuthorNode, ZoomLevel } from '../../types/nodes'
import { useStore } from '../../store/useStore'

interface Props {
  node: AuthorNode
  zoomLevel: ZoomLevel
  isSelected: boolean
  isConnected: boolean
  dimmed: boolean
}

export function AuthorStar3D({ node, zoomLevel, isSelected, isConnected, dimmed }: Props) {
  const selectAuthor = useStore((s) => s.selectAuthor)
  const setHoveredNode = useStore((s) => s.setHoveredNode)
  const setFlyToTarget = useStore((s) => s.setFlyToTarget)
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const color = new THREE.Color(node.color)
  const emissiveIntensity = isSelected ? 2 : isConnected ? 1 : 0.5
  const scale = hovered ? 1.2 : 1
  const opacity = dimmed ? 0.15 : 1

  // Pulse animation for selected node
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      meshRef.current.scale.setScalar(node.radius * pulse)
    }
  })

  return (
    <group position={[node.x, node.y, node.z]}>
      <Detailed distances={[0, 100, 500]}>
        {/* Near: full detail */}
        <group>
          <mesh
            ref={meshRef}
            scale={node.radius * scale}
            onClick={(e) => {
              e.stopPropagation()
              if (isSelected) {
                selectAuthor(null)
              } else {
                selectAuthor(node.id)
                setFlyToTarget([node.x, node.y, node.z])
              }
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(true)
              setHoveredNode(node.id)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              setHovered(false)
              setHoveredNode(null)
              document.body.style.cursor = 'auto'
            }}
          >
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={emissiveIntensity}
              transparent
              opacity={opacity}
            />
          </mesh>

          {/* Glow halo */}
          {(isSelected || isConnected) && (
            <mesh scale={node.radius * 3}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={isSelected ? 0.12 : 0.06}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Name label */}
          <Billboard position={[0, node.radius + 0.5, 0]}>
            <Text
              fontSize={0.4}
              color="#e0d6c8"
              anchorX="center"
              anchorY="bottom"
              fillOpacity={dimmed ? 0.2 : 0.9}
            >
              {node.label}
            </Text>
          </Billboard>

          {/* Style labels when selected */}
          {isSelected && node.styleLabels.length > 0 && (
            <Billboard position={[0, node.radius + 1.2, 0]}>
              <Text
                fontSize={0.25}
                color={node.color}
                anchorX="center"
                anchorY="bottom"
                fillOpacity={0.6}
              >
                {node.styleLabels.join(' · ')}
              </Text>
            </Billboard>
          )}
        </group>

        {/* Mid: sphere + name */}
        <group>
          <mesh
            scale={node.radius * scale}
            onClick={(e) => {
              e.stopPropagation()
              if (isSelected) {
                selectAuthor(null)
              } else {
                selectAuthor(node.id)
                setFlyToTarget([node.x, node.y, node.z])
              }
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(true)
              setHoveredNode(node.id)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              setHovered(false)
              setHoveredNode(null)
              document.body.style.cursor = 'auto'
            }}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={emissiveIntensity}
              transparent
              opacity={opacity}
            />
          </mesh>
          <Billboard position={[0, node.radius + 0.5, 0]}>
            <Text
              fontSize={0.4}
              color="#e0d6c8"
              anchorX="center"
              anchorY="bottom"
              fillOpacity={dimmed ? 0.2 : 0.9}
            >
              {node.label}
            </Text>
          </Billboard>
        </group>

        {/* Far: just a point */}
        <mesh scale={node.radius * 0.5}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      </Detailed>
    </group>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/scene/AuthorStar3D.tsx
git commit -m "feat: add AuthorStar3D with 3-level LOD"
```

---

### Task 7: Create RelationshipCurve3D

**Files:**
- Create: `src/components/scene/RelationshipCurve3D.tsx`

- [ ] **Step 1: Create `src/components/scene/RelationshipCurve3D.tsx`**

```tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { QuadraticBezierLine } from '@react-three/drei'
import * as THREE from 'three'
import type { AuthorNode, RelationshipEdge } from '../../types/nodes'

interface Props {
  edge: RelationshipEdge
  sourceNode: AuthorNode
  targetNode: AuthorNode
  highlighted: boolean
  dimmed: boolean
}

export function RelationshipCurve3D({ edge, sourceNode, targetNode, highlighted, dimmed }: Props) {
  const lineRef = useRef<any>(null)

  const start = new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z)
  const end = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z)

  // Control point: midpoint + Y offset + Z offset
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  mid.y += 5
  mid.z += (targetNode.z - sourceNode.z) * 0.25

  const opacity = dimmed ? 0.03 : highlighted ? 0.8 : 0.25
  const lineWidth = highlighted ? 2 : 1

  // Flow animation
  useFrame((state) => {
    if (lineRef.current?.material) {
      lineRef.current.material.dashOffset = -state.clock.elapsedTime * 0.5
    }
  })

  return (
    <QuadraticBezierLine
      ref={lineRef}
      start={[start.x, start.y, start.z]}
      end={[end.x, end.y, end.z]}
      mid={[mid.x, mid.y, mid.z]}
      color={edge.color}
      lineWidth={lineWidth}
      dashed
      dashScale={5}
      dashSize={0.5}
      gapSize={0.3}
      opacity={opacity}
    />
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/scene/RelationshipCurve3D.tsx
git commit -m "feat: add RelationshipCurve3D with bezier curves and flow animation"
```

---

### Task 8: Create PoemOrbit3D

**Files:**
- Create: `src/components/scene/PoemOrbit3D.tsx`

- [ ] **Step 1: Create `src/components/scene/PoemOrbit3D.tsx`**

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Poem } from '../../types/poem'
import type { AuthorNode, ZoomLevel } from '../../types/nodes'
import { useStore } from '../../store/useStore'

interface Props {
  authorNode: AuthorNode
  poems: Poem[]
  zoomLevel: ZoomLevel
}

export function PoemOrbit3D({ authorNode, poems, zoomLevel }: Props) {
  const selectPoem = useStore((s) => s.selectPoem)
  const selectedPoemId = useStore((s) => s.selectedPoemId)
  const groupRef = useRef<THREE.Group>(null)

  // Distribute poems on a sphere surface
  const poemPositions = useMemo(() => {
    const orbitRadius = authorNode.radius * 4 + 2
    return poems.map((poem, i) => {
      // Fibonacci sphere distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / poems.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      return {
        poem,
        position: new THREE.Vector3(
          orbitRadius * Math.sin(phi) * Math.cos(theta),
          orbitRadius * Math.sin(phi) * Math.sin(theta),
          orbitRadius * Math.cos(phi)
        ),
      }
    })
  }, [authorNode.radius, poems])

  // Slow rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1
    }
  })

  if (zoomLevel === 'galaxy') return null

  return (
    <group ref={groupRef} position={[authorNode.x, authorNode.y, authorNode.z]}>
      {poemPositions.map(({ poem, position }) => {
        const isSelected = poem.id === selectedPoemId
        return (
          <group key={poem.id} position={position}>
            <mesh
              scale={isSelected ? 0.25 : 0.15}
              onClick={(e) => {
                e.stopPropagation()
                selectPoem(isSelected ? null : poem.id)
              }}
              onPointerOver={() => { document.body.style.cursor = 'pointer' }}
              onPointerOut={() => { document.body.style.cursor = 'auto' }}
            >
              <sphereGeometry args={[1, 12, 12]} />
              <meshStandardMaterial
                color="#e0d6c8"
                emissive="#e0d6c8"
                emissiveIntensity={isSelected ? 1.5 : 0.5}
                transparent
                opacity={isSelected ? 0.9 : 0.6}
              />
            </mesh>
            {zoomLevel === 'poet' && (
              <Billboard position={[0, 0.4, 0]}>
                <Text
                  fontSize={0.2}
                  color="#e0d6c8"
                  anchorX="center"
                  anchorY="bottom"
                  fillOpacity={isSelected ? 0.9 : 0.5}
                >
                  {poem.title}
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
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/scene/PoemOrbit3D.tsx
git commit -m "feat: add PoemOrbit3D with fibonacci sphere distribution"
```

---

### Task 9: Create TimelineRail3D

**Files:**
- Create: `src/components/scene/TimelineRail3D.tsx`

- [ ] **Step 1: Create `src/components/scene/TimelineRail3D.tsx`**

```tsx
import { Billboard, Text, Line } from '@react-three/drei'
import type { DynastyRegion } from '../../types/nodes'
import { WORLD_3D } from '../../lib/layout'

interface Props {
  regions: DynastyRegion[]
}

export function TimelineRail3D({ regions }: Props) {
  const y = WORLD_3D.Y_RANGE[0] - 2

  return (
    <group>
      {/* Main timeline line */}
      <Line
        points={[
          [WORLD_3D.X_RANGE[0], y, 0],
          [WORLD_3D.X_RANGE[1], y, 0],
        ]}
        color="#e0d6c8"
        lineWidth={1}
        transparent
        opacity={0.15}
      />

      {/* Dynasty labels along the rail */}
      {regions.map((r) => {
        const cx = (r.x0 + r.x1) / 2
        return (
          <group key={r.dynasty.id}>
            <Billboard position={[cx, y - 0.5, 0]}>
              <Text
                fontSize={0.5}
                color={r.color}
                anchorX="center"
                anchorY="top"
                fillOpacity={0.5}
              >
                {r.dynasty.name}
              </Text>
            </Billboard>
            <Billboard position={[cx, y - 1.3, 0]}>
              <Text
                fontSize={0.3}
                color="#e0d6c8"
                anchorX="center"
                anchorY="top"
                fillOpacity={0.25}
              >
                {r.dynasty.startYear < 0 ? `前${Math.abs(r.dynasty.startYear)}` : r.dynasty.startYear}
                —{r.dynasty.endYear}
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
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/scene/TimelineRail3D.tsx
git commit -m "feat: add TimelineRail3D with dynasty labels"
```

---

## Phase 3: Integration

### Task 10: Wire all 3D components into Universe3D

**Files:**
- Modify: `src/components/scene/Universe3D.tsx`

- [ ] **Step 1: Rewrite `src/components/scene/Universe3D.tsx`**

```tsx
import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import authors from '../../data/authors.json'
import poems from '../../data/poems.json'
import dynasties from '../../data/dynasties.json'
import relationshipsData from '../../data/relationships.json'
import type { Author, Poem, Dynasty } from '../../types/poem'
import type { RelationshipEdge as EdgeType } from '../../types/nodes'
import { useStore } from '../../store/useStore'
import { build3DTimeScale, buildDynastyRegions } from '../../lib/layout'
import { layoutAuthors3D } from '../../lib/layout'
import { StarfieldBackground } from './StarfieldBackground'
import { CameraController } from './CameraController'
import { DynastyNebula3D } from './DynastyNebula3D'
import { AuthorStar3D } from './AuthorStar3D'
import { RelationshipCurve3D } from './RelationshipCurve3D'
import { PoemOrbit3D } from './PoemOrbit3D'
import { TimelineRail3D } from './TimelineRail3D'

function Scene() {
  const zoomLevel = useStore((s) => s.zoomLevel)
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)

  const timeScale = useMemo(() => build3DTimeScale(), [])

  const authorNodes = useMemo(
    () => layoutAuthors3D(authors as Author[], poems as Poem[], timeScale),
    [timeScale]
  )

  const dynastyRegions = useMemo(
    () => buildDynastyRegions(dynasties as Dynasty[], timeScale),
    [timeScale]
  )

  const edges = useMemo<EdgeType[]>(() => {
    const nodeIds = new Set(authorNodes.map((n) => n.id))
    const types = relationshipsData.relationship_types as Record<
      string, { label: string; color: string; dashArray: string }
    >
    return relationshipsData.author_relationships
      .filter((r) => nodeIds.has(r.source) && nodeIds.has(r.target))
      .map((r) => ({
        source: r.source,
        target: r.target,
        type: r.type,
        label: r.label,
        description: r.description,
        strength: r.strength,
        color: types[r.type]?.color ?? '#888',
        dashArray: types[r.type]?.dashArray ?? '',
      }))
  }, [authorNodes])

  const nodeMap = useMemo(
    () => new Map(authorNodes.map((n) => [n.id, n])),
    [authorNodes]
  )

  const connectedIds = useMemo(() => {
    if (!selectedAuthorId) return new Set<string>()
    const ids = new Set<string>()
    for (const e of edges) {
      if (e.source === selectedAuthorId) ids.add(e.target)
      if (e.target === selectedAuthorId) ids.add(e.source)
    }
    return ids
  }, [selectedAuthorId, edges])

  const selectedPoems = useMemo(
    () =>
      selectedAuthorId
        ? (poems as Poem[]).filter((p) => p.authorId === selectedAuthorId)
        : [],
    [selectedAuthorId]
  )

  return (
    <>
      <ambientLight intensity={0.3} />
      <CameraController />
      <StarfieldBackground />

      {dynastyRegions.map((region) => (
        <DynastyNebula3D key={region.dynasty.id} region={region} zoomLevel={zoomLevel} />
      ))}

      {edges.map((e) => {
        const src = nodeMap.get(e.source)
        const tgt = nodeMap.get(e.target)
        if (!src || !tgt) return null
        const highlighted = e.source === selectedAuthorId || e.target === selectedAuthorId
        const dimmed = !!selectedAuthorId && !highlighted
        return (
          <RelationshipCurve3D
            key={`${e.source}-${e.target}`}
            edge={e}
            sourceNode={src}
            targetNode={tgt}
            highlighted={highlighted}
            dimmed={dimmed}
          />
        )
      })}

      {authorNodes.map((node) => {
        const isSelected = node.id === selectedAuthorId
        const isConnected = connectedIds.has(node.id)
        const dimmed = !!selectedAuthorId && !isSelected && !isConnected
        return (
          <AuthorStar3D
            key={node.id}
            node={node}
            zoomLevel={zoomLevel}
            isSelected={isSelected}
            isConnected={isConnected}
            dimmed={dimmed}
          />
        )
      })}

      {selectedAuthorId && selectedPoems.length > 0 && nodeMap.get(selectedAuthorId) && (
        <PoemOrbit3D
          authorNode={nodeMap.get(selectedAuthorId)!}
          poems={selectedPoems}
          zoomLevel={zoomLevel}
        />
      )}

      <TimelineRail3D regions={dynastyRegions} />
    </>
  )
}

export function Universe3D() {
  return (
    <Canvas
      camera={{ position: [0, 20, 60], fov: 60, near: 0.1, far: 1000 }}
      style={{ position: 'absolute', inset: 0 }}
      fallback={
        <div className="absolute inset-0 flex items-center justify-center">
          <p style={{ color: '#e0d6c8' }}>加载 3D 场景中...</p>
        </div>
      }
    >
      <Scene />
    </Canvas>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/scene/Universe3D.tsx
git commit -m "feat: wire all 3D components into Universe3D scene"
```

---

### Task 11: Wire Universe3D into App.tsx with ErrorBoundary

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Rewrite `src/App.tsx`**

```tsx
import { Component, type ReactNode } from 'react'
import { useStore } from './store/useStore'
import { Universe3D } from './components/scene/Universe3D'
import { HUD } from './components/HUD'
import { SearchOverlay } from './components/SearchOverlay'
import { PoemReader } from './components/PoemReader'
import AuthorPanel from './components/AuthorPanel'
import authors from './data/authors.json'
import poems from './data/poems.json'
import dynasties from './data/dynasties.json'
import type { Author, Poem, Dynasty } from './types/poem'
import { getDynastyColor } from './lib/colorScales'

class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <p style={{ color: '#e0d6c8', fontFamily: "'LXGW WenKai', serif" }}>
            您的浏览器不支持 3D 渲染，请使用 Chrome/Firefox 最新版
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const selectAuthor = useStore((s) => s.selectAuthor)
  const selectPoem = useStore((s) => s.selectPoem)

  const selectedAuthor = selectedAuthorId
    ? (authors as Author[]).find((a) => a.id === selectedAuthorId) ?? null
    : null
  const authorPoems = selectedAuthorId
    ? (poems as Poem[]).filter((p) => p.authorId === selectedAuthorId)
    : []
  const dynastyColor = selectedAuthorId
    ? getDynastyColor((authors as Author[]).find((a) => a.id === selectedAuthorId)?.dynastyId ?? '')
    : '#888'
  const getDynastyName = (dynastyId: string) =>
    (dynasties as Dynasty[]).find((d) => d.id === dynastyId)?.name ?? dynastyId

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-[#0a0a14]">
      <WebGLErrorBoundary>
        <Universe3D />
      </WebGLErrorBoundary>
      <HUD />
      <SearchOverlay
        onSelectAuthor={(id) => selectAuthor(id)}
        onSelectPoem={(id) => selectPoem(id)}
      />
      <PoemReader />
      {selectedAuthor && (
        <AuthorPanel
          author={{ ...selectedAuthor, dynastyId: getDynastyName(selectedAuthor.dynastyId) }}
          poems={authorPoems}
          dynastyColor={dynastyColor}
          onClose={() => selectAuthor(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify full build**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire Universe3D into App with WebGL ErrorBoundary"
```

---

### Task 12: Final cleanup and smoke test

**Files:**
- Verify: all files

- [ ] **Step 1: Remove empty directories if any**

```bash
rmdir src/components/visualizations/shared 2>/dev/null || true
rmdir src/components/visualizations 2>/dev/null || true
```

- [ ] **Step 2: Run full build**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev` (user runs manually)

Verify:
- 3D starfield background renders
- Dynasty nebula clouds visible with labels
- Author star nodes positioned along timeline
- Scroll to zoom, drag to rotate
- Click author → node highlights, poem satellites appear
- Click poem satellite → PoemReader overlay opens
- Search → results appear, click result → author selected
- "全景" button → camera flies back to initial position
- HUD breadcrumb shows zoom level

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: cleanup, finalize 3D metaverse v1"
```
