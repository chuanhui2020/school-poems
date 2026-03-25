# 诗词元宇宙性能与视觉优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize the 3D poetry universe for performance (reduce draw calls from ~180 to ~15, eliminate GC pressure, cut font from 25MB to ~300KB) and visual quality (post-processing, adaptive layout for dense dynasties, better zoom UX).

**Architecture:** Replace per-author 3D objects with InstancedMesh batching, merge dynasty nebula particles, move semantic zoom into frame loop, rewrite layout algorithm with data-driven spiral distribution, add postprocessing pipeline (Bloom + ToneMapping + Vignette + depth fog), and custom star shader with fresnel/noise.

**Tech Stack:** React Three Fiber 9, Three.js 0.183, @react-three/drei 10, @react-three/postprocessing (new), zustand 5, TypeScript 5.9

**Spec:** `docs/superpowers/specs/2026-03-25-performance-visual-optimization-design.md`

---

## File Structure

### New Files
- `src/components/AuthorStarField.tsx` — InstancedMesh renderer for all author stars + hover/select labels
- `src/components/DynastyNebulaField.tsx` — Merged particle cloud for all 8 dynasty nebulae
- `src/components/PostProcessing.tsx` — EffectComposer with Bloom, ToneMapping, Vignette, depth fog
- `src/shaders/starMaterial.ts` — Custom ShaderMaterial with noise + fresnel + breathing pulse
- `scripts/subset-font.sh` — Build script to subset LXGW WenKai font

### Modified Files
- `src/lib/layout.ts` — Rewrite `layoutAuthors3D` with spiral distribution algorithm
- `src/components/Universe3D.tsx` — Replace AuthorStar3D loop with AuthorStarField, DynastyNebula3D loop with DynastyNebulaField, add PostProcessing
- `src/components/CameraController.tsx` — Inline semantic zoom, dynamic zoomSpeed, dolly-toward-cursor
- `src/components/RelationshipCurve3D.tsx` — Memoize Vector3 allocations
- `src/components/TimelineRail3D.tsx` — Update font path
- `src/hooks/useSemanticZoom.ts` — Simplify to pure function (remove useEffect)
- `src/store/useStore.ts` — Remove unused `useSemanticZoom` import path
- `package.json` — Add `@react-three/postprocessing`

### Deleted Files
- `src/components/AuthorStar3D.tsx` — Replaced by AuthorStarField
- `src/components/DynastyNebula3D.tsx` — Replaced by DynastyNebulaField
- `public/fonts/LXGWWenKai-Regular.ttf` — Replaced by subset woff2

---

## Task 1: Install postprocessing dependency

**Files:** `package.json`

- [ ] **Step 1:** Run `npm install @react-three/postprocessing`
- [ ] **Step 2:** Verify: `npx tsc --noEmit && npm run build` — PASS
- [ ] **Step 3:** Commit: `git add package.json package-lock.json && git commit -m "chore: add @react-three/postprocessing"`

---

## Task 2: Font subsetting

**Files:**
- Create: `scripts/subset-font.sh`
- Create: `public/fonts/LXGWWenKai-Subset.woff2`
- Modify: all components referencing `/fonts/LXGWWenKai-Regular.ttf`
- Delete: `public/fonts/LXGWWenKai-Regular.ttf`

- [ ] **Step 1: Create subset script** `scripts/subset-font.sh`

Uses `node` to extract all unique chars from JSON data, then `pyftsubset` to create woff2 subset. Chars include: all author names, dynasty names, poem titles, plus UI strings and digits/latin.

- [ ] **Step 2: Run subset**

```bash
pip install fonttools brotli 2>/dev/null
bash scripts/subset-font.sh
```

Expected output: ~200-500KB woff2 file. If fonttools unavailable, keep full TTF as fallback.

- [ ] **Step 3: Update font paths**

Replace `/fonts/LXGWWenKai-Regular.ttf` → `/fonts/LXGWWenKai-Subset.woff2` in:
- `src/components/DynastyNebula3D.tsx:70`
- `src/components/TimelineRail3D.tsx:95`
- `src/components/PoemOrbit3D.tsx:86`

Note: `AuthorStar3D.tsx` is not updated here — it will be deleted in Task 6. The new `AuthorStarField.tsx` should use the subset font path from the start.

- [ ] **Step 4:** Remove `public/fonts/LXGWWenKai-Regular.ttf`
- [ ] **Step 5:** Verify build passes
- [ ] **Step 6:** Commit: `"perf: subset LXGW WenKai font from 25MB to ~300KB woff2"`

---

## Task 3: Rewrite layout algorithm with spiral distribution

**Files:** `src/lib/layout.ts`

- [ ] **Step 1: Add spiral constants** at top of `layout.ts`:

```typescript
export const SPIRAL = {
  RADIUS_FACTOR: 12,
  SPREAD_FACTOR: 18,
  MIN_SPACING: 8,
  X_JITTER_SCALE: 3,
} as const
```

- [ ] **Step 2: Rewrite `layoutAuthors3D`**

Key changes:
- Use golden-angle spiral: `angle = i * PI * (3 - sqrt(5))`
- Spiral is applied per-dynasty group (inner loop), not globally. `i` and `n` are per-dynasty counts.
- `spiralRadius = sqrt(n) * SPIRAL.RADIUS_FACTOR`
- `yOffset = sin(angle) * spiralRadius * t`
- `zSpiral = cos(angle) * spiralRadius * t * 0.6`
- Layer style-based Z on top of spiral Z
- Deterministic X jitter: `((i % 5) - 2) * X_JITTER_SCALE`
- Keep existing `STYLE_Z_MAP` and `WORLD3D` constants

- [ ] **Step 3:** Verify build: `npx tsc --noEmit && npm run build`
- [ ] **Step 4:** Commit: `"feat: rewrite layoutAuthors3D with data-driven spiral distribution"`

---

## Task 4: Inline semantic zoom into CameraController

**Files:**
- Modify: `src/hooks/useSemanticZoom.ts`
- Modify: `src/components/CameraController.tsx`
- Modify: `src/store/useStore.ts`

- [ ] **Step 1: Simplify useSemanticZoom to pure function**

Remove `useSemanticZoom` hook, keep only `getZoomLevel` as pure function. Update thresholds: `galaxy > 200`, `dynasty > 60`, `poet < 60`.

- [ ] **Step 2: Add `zoomDistance` to store**

- [ ] **Step 2: Rewrite CameraController**

Key changes:
- Remove `useSemanticZoom` call
- In `useFrame`: compute `distance = camera.position.length()`, call `getZoomLevel(distance)`, only `setZoomLevel` when changed
- Dynamic `zoomSpeed`: `> 200 → 0.8`, `> 60 → 0.5`, `< 60 → 0.3`
- Use `ref` for OrbitControls instead of `useThree().controls`

- [ ] **Step 3:** Verify build
- [ ] **Step 4:** Commit: `"perf: inline semantic zoom into frame loop, add dynamic zoom speed"`

---

## Task 5: Memoize RelationshipCurve3D Vector3 allocations

**Files:** `src/components/RelationshipCurve3D.tsx`

- [ ] **Step 1: Memoize start/end/mid together**

Replace lines 30-39 with single `useMemo`:

```typescript
const { start, end, mid } = useMemo(() => {
  const s = new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z)
  const e = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z)
  const m = s.clone().lerp(e, 0.5)
  m.y += Math.max(10, s.distanceTo(e) * 0.25)
  m.z += (sourceNode.z + targetNode.z) / 2
  return { start: s, end: e, mid: m }
}, [sourceNode.x, sourceNode.y, sourceNode.z, targetNode.x, targetNode.y, targetNode.z])
```

- [ ] **Step 2:** Verify build
- [ ] **Step 3:** Commit: `"perf: memoize Vector3 allocations in RelationshipCurve3D"`

---

## Task 6: Create AuthorStarField with InstancedMesh

**Files:**
- Create: `src/components/AuthorStarField.tsx`
- Modify: `src/components/Universe3D.tsx`
- Delete: `src/components/AuthorStar3D.tsx`

- [ ] **Step 1: Create AuthorStarField.tsx**

Component structure:
```
AuthorStarField({ nodes: AuthorNode[], zoomLevel: ZoomLevel })
  ├── <instancedMesh> with SphereGeometry(1, 16, 16)
  │   - setMatrixAt per node (position + scale from radius)
  │   - setColorAt per node (dynasty color)
  │   - MeshStandardMaterial with emissive
  │   - frustumCulled={false}
  │   - onPointerMove → event.instanceId → setHoveredNode
  │   - onClick → event.instanceId → selectAuthor + setFlyToTarget
  ├── useFrame: animate hovered/selected instance scale via _tempMatrix/_tempVec (pre-allocated)
  ├── {hoveredNode && <Billboard><Text> for hovered label}
  └── {selectedNode && <Billboard><Text> for selected label}
```

Important: All `<Text>` components must include `font="/fonts/LXGWWenKai-Subset.woff2"` to render Chinese characters.

LOD behavior based on `zoomLevel`:
- `galaxy`: all stars rendered small (base radius), no labels
- `dynasty`: normal radius, show labels for poemCount > 3
- `poet`: enlarged radius, show all labels in view

- [ ] **Step 2: Wire into Universe3D**

Replace the `visibleAuthors.map(node => <AuthorStar3D>)` block with:
```tsx
<AuthorStarField nodes={visibleAuthors} zoomLevel={zoomLevel} />
```

Add `zoomLevel` from store. Remove `AuthorStar3D` import.

- [ ] **Step 3: Delete AuthorStar3D.tsx**
- [ ] **Step 4:** Verify build
- [ ] **Step 5:** Commit: `"perf: replace 79 AuthorStar3D with single InstancedMesh AuthorStarField"`

---

## Task 7: Create DynastyNebulaField with merged particles

**Files:**
- Create: `src/components/DynastyNebulaField.tsx`
- Modify: `src/components/Universe3D.tsx`
- Delete: `src/components/DynastyNebula3D.tsx`

- [ ] **Step 1: Create DynastyNebulaField.tsx**

Component structure:
```
DynastyNebulaField({ dynasties: Dynasty[] })
  ├── <points> with merged BufferGeometry
  │   - positions: Float32Array(totalParticles * 3) — all 8 nebulae combined
  │   - colors: Float32Array(totalParticles * 3) — per-particle dynasty color
  │   - PointsMaterial with vertexColors, transparent, opacity 0.25
  │   - useFrame: slow rotation (rotation.y += delta * 0.01)
  └── {dynasties.map → <Billboard><Text> for each dynasty name label, with click → flyToTarget}
```

120 particles per dynasty = 960 total, 1 draw call.
Each dynasty's particles positioned in ellipsoid around its time-axis center (same math as current DynastyNebula3D).

Important: All `<Text>` components must include `font="/fonts/LXGWWenKai-Subset.woff2"`.

Dynasty label click handler: clicking a dynasty label calls `setFlyToTarget([xMid, 0, 0])` where `xMid` is the dynasty's time-axis center, flying the camera to dynasty-level zoom.

- [ ] **Step 2: Wire into Universe3D**

Replace `dynasties.map(d => <DynastyNebula3D>)` with:
```tsx
<DynastyNebulaField dynasties={dynasties} />
```

- [ ] **Step 3: Delete DynastyNebula3D.tsx**
- [ ] **Step 4:** Verify build
- [ ] **Step 5:** Commit: `"perf: merge 8 dynasty nebulae into single DynastyNebulaField"`

---

## Task 8: Create custom star shader material

**Files:**
- Create: `src/shaders/starMaterial.ts`
- Modify: `src/components/AuthorStarField.tsx`

- [ ] **Step 1: Create starMaterial.ts**

Custom `ShaderMaterial` with:
- Vertex shader: pass `vNormal`, `vPosition`, `vUv` to fragment
- Fragment shader:
  - Simplex noise on surface (3D noise based on position + time) for cloud/ink texture
  - Fresnel rim light: `pow(1.0 - dot(viewDir, normal), 2.0)` for edge glow
  - Breathing pulse: `emissiveIntensity * (0.8 + 0.2 * sin(time * 0.5))`
- Uniforms: `uTime`, `uColor`, `uEmissiveIntensity`
- Export as factory function: `createStarMaterial(color: THREE.Color): THREE.ShaderMaterial`

Note: InstancedMesh uses a single material, so the shader should read per-instance color from the instance color attribute rather than a uniform. Use `instanceColor` attribute.

- [ ] **Step 2: Integrate into AuthorStarField**

Replace `MeshStandardMaterial` with the custom shader material. Pass `uTime` in useFrame.

- [ ] **Step 3:** Verify build + visual check
- [ ] **Step 4:** Commit: `"feat: add custom star shader with noise, fresnel, and breathing pulse"`

---

## Task 9: Add PostProcessing pipeline

**Files:**
- Create: `src/components/PostProcessing.tsx`
- Modify: `src/components/Universe3D.tsx`

- [ ] **Step 1: Create PostProcessing.tsx**

```typescript
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

export function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.3} darkness={0.7} />
    </EffectComposer>
  )
}
```

Note: Depth fog deferred — Bloom + ToneMapping + Vignette provide the biggest visual lift. Depth fog can be added later if needed.

- [ ] **Step 2: Add to Universe3D Scene**

Inside `<Canvas>`, after `<Scene />`:
```tsx
<PostProcessing />
```

- [ ] **Step 3:** Verify build + visual check
- [ ] **Step 4:** Commit: `"feat: add postprocessing pipeline with Bloom, ToneMapping, Vignette"`

---

## Task 10: Wire everything together + cleanup

**Files:**
- Modify: `src/components/Universe3D.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Clean up Universe3D imports**

Remove unused imports: `AuthorStar3D`, `DynastyNebula3D`. Ensure `AuthorStarField`, `DynastyNebulaField`, `PostProcessing` are imported. Pass `zoomLevel` from store to `AuthorStarField`.

- [ ] **Step 2: Verify CSS z-index fix**

Confirm `#root` has `z-index: 2` in `src/index.css` (already applied earlier).

- [ ] **Step 3: Full build + type check**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: wire optimized components, remove dead code"
```

---

## Task 11: Final verification

- [ ] **Step 1:** Run `npm run dev`, open browser, verify:
  - 3D scene loads quickly (no 25MB font blocking)
  - Stars visible and colored by dynasty
  - Tang/Song poets spread out in spiral, not overlapping
  - Zoom in/out smooth, speed adapts to distance
  - Bloom glow visible on stars
  - HUD and search overlay functional
  - Click author → panel opens, poems orbit appears
- [ ] **Step 2:** Open browser DevTools → Performance tab, check:
  - Draw calls significantly reduced
  - No GC spikes during interaction
  - Stable 60fps during orbit/zoom
- [ ] **Step 3:** Commit any final fixes
