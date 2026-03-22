import { create } from 'zustand'
import type { FilterState, RelationshipType } from '../types'

interface AppState extends FilterState {
  selectedPoemId: string | null;
  selectedAuthorId: string | null;
  hoveredNodeId: string | null;

  setSelectedDynasties: (ids: string[]) => void;
  toggleDynasty: (id: string) => void;
  setSelectedThemes: (themes: string[]) => void;
  toggleTheme: (theme: string) => void;
  setSelectedRelationshipTypes: (types: RelationshipType[]) => void;
  toggleRelationshipType: (type: RelationshipType) => void;
  setSearchQuery: (query: string) => void;
  setCurriculumLevel: (level: 'all' | 'middle_school' | 'high_school') => void;
  setSelectedPoemId: (id: string | null) => void;
  setSelectedAuthorId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  resetFilters: () => void;
}

export const useStore = create<AppState>((set) => ({
  selectedDynasties: [],
  selectedThemes: [],
  selectedRelationshipTypes: [],
  searchQuery: '',
  curriculumLevel: 'all',
  selectedPoemId: null,
  selectedAuthorId: null,
  hoveredNodeId: null,

  setSelectedDynasties: (ids) => set({ selectedDynasties: ids }),
  toggleDynasty: (id) =>
    set((s) => ({
      selectedDynasties: s.selectedDynasties.includes(id)
        ? s.selectedDynasties.filter((d) => d !== id)
        : [...s.selectedDynasties, id],
    })),
  setSelectedThemes: (themes) => set({ selectedThemes: themes }),
  toggleTheme: (theme) =>
    set((s) => ({
      selectedThemes: s.selectedThemes.includes(theme)
        ? s.selectedThemes.filter((t) => t !== theme)
        : [...s.selectedThemes, theme],
    })),
  setSelectedRelationshipTypes: (types) => set({ selectedRelationshipTypes: types }),
  toggleRelationshipType: (type) =>
    set((s) => ({
      selectedRelationshipTypes: s.selectedRelationshipTypes.includes(type)
        ? s.selectedRelationshipTypes.filter((t) => t !== type)
        : [...s.selectedRelationshipTypes, type],
    })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCurriculumLevel: (level) => set({ curriculumLevel: level }),
  setSelectedPoemId: (id) => set({ selectedPoemId: id }),
  setSelectedAuthorId: (id) => set({ selectedAuthorId: id }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  resetFilters: () =>
    set({
      selectedDynasties: [],
      selectedThemes: [],
      selectedRelationshipTypes: [],
      searchQuery: '',
      curriculumLevel: 'all',
    }),
}))
