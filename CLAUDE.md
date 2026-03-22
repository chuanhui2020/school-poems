# 古诗词网络 — School Poems Network

## Project Overview
Interactive web visualization of all classical Chinese poems from the 部编版 (PEP) middle school and high school curriculum (~133 poems).

## Tech Stack
- Vite + React + TypeScript
- D3.js (computation only, React renders SVG)
- react-router-dom for routing
- zustand for state management
- Tailwind CSS with custom classical Chinese theme
- fuse.js for Chinese fuzzy search
- LXGW WenKai font for classical aesthetics

## Key Conventions
- Data files are static JSON in `src/data/`
- D3 force simulation runs via custom hooks (`useSimulation`, `useZoom`)
- Graph data transformations in `src/lib/graphTransformers.ts`
- Chinese quotation marks use「」instead of "" inside JSON strings
- Dynasty IDs: pre-qin, han, wei-jin, tang, song, yuan, ming, qing
- Author/poem IDs use kebab-case romanization

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npx tsc --noEmit` — type check
