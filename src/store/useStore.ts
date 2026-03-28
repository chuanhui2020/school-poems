import { create } from 'zustand'
import type { ZoomLevel } from '../types'

interface UniverseState {
  // View
  zoomLevel: ZoomLevel
  setZoomLevel: (level: ZoomLevel) => void

  // Selection
  selectedAuthorId: string | null
  selectAuthor: (id: string | null) => void
  selectedPoemId: string | null
  selectPoem: (id: string | null) => void

  // Hover
  hoveredNodeId: string | null
  setHoveredNode: (id: string | null) => void

  // Zoom control (set by useUniverseZoom, called by HUD)
  resetZoom: (() => void) | null
  setResetZoom: (fn: (() => void) | null) => void

  // Camera fly-to target [x, y, z]
  flyToTarget: [number, number, number] | null
  setFlyToTarget: (target: [number, number, number] | null) => void

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchOpen: boolean
  toggleSearch: () => void

  // Filters
  selectedDynasties: string[]
  toggleDynasty: (id: string) => void
}

export const useStore = create<UniverseState>((set) => ({
  zoomLevel: 'galaxy',
  setZoomLevel: (level) => set({ zoomLevel: level }),

  selectedAuthorId: null,
  selectAuthor: (id) => set({ selectedAuthorId: id, selectedPoemId: null }),
  selectedPoemId: null,
  selectPoem: (id) => set({ selectedPoemId: id }),

  hoveredNodeId: null,
  setHoveredNode: (id) => set({ hoveredNodeId: id }),

  resetZoom: null,
  setResetZoom: (fn) => set({ resetZoom: fn }),

  flyToTarget: null,
  setFlyToTarget: (target) => set({ flyToTarget: target }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  searchOpen: false,
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),

  selectedDynasties: [],
  toggleDynasty: (id) =>
    set((s) => ({
      selectedDynasties: s.selectedDynasties.includes(id)
        ? s.selectedDynasties.filter((d) => d !== id)
        : [...s.selectedDynasties, id],
    })),
}))
