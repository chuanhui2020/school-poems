# Cyber Ink Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the poetry metaverse from cosmic/space theme to cyber ink-wash (赛博水墨) style with unified UI and touch gesture support.

**Architecture:** Bottom-up approach — start with shared foundations (CSS, shader utilities, textures), then rebuild 3D visual components, then UI overlays, then interaction/animation polish. Each task produces a buildable, visually verifiable result.

**Tech Stack:** React Three Fiber, Three.js custom GLSL shaders, Tailwind CSS v4, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-28-cyber-ink-redesign.md`

---

## File Structure

### New Files
- `src/shaders/noise.ts` — shared GLSL noise functions (simplex, fbm)
- `src/shaders/inkMountainShader.ts` — background mountain silhouettes
- `src/shaders/inkParticleShader.ts` — flowing ink particle material
- `src/shaders/inkNebulaShader.ts` — dynasty ink-wash billboard material
- `src/shaders/inkStarShader.ts` — author node ink + neon glow (replaces starMaterial.ts)
- `src/shaders/inkLineShader.ts` — relationship line brush-stroke material
- `src/components/InkBackground.tsx` — replaces StarfieldBackground.tsx (mountains + particles)
- `src/components/HoverCard.tsx` — hover tooltip card for author preview
- `public/textures/brush-stroke.png` — 512x512 grayscale brush mask
- `public/textures/rice-paper.jpg` — 1024x1024 paper texture
- `public/textures/stamp.svg` — seal/stamp icon

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
