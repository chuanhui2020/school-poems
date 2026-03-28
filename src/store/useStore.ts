import { create } from 'zustand'

type Scene = 'landing' | 'world' | 'poet' | 'poem'

interface AppState {
  // Current scene
  currentScene: Scene
  setCurrentScene: (scene: Scene) => void

  // Dialogue
  dialogueOpen: boolean
  setDialogueOpen: (open: boolean) => void

  // Dynasty filter in world view
  selectedDynasties: string[]
  toggleDynasty: (id: string) => void

  // Revealed lines in poem view
  revealedLines: number[]
  setRevealedLines: (lines: number[]) => void
}

export const useStore = create<AppState>((set) => ({
  currentScene: 'landing',
  setCurrentScene: (scene) => set({ currentScene: scene }),

  dialogueOpen: false,
  setDialogueOpen: (open) => set({ dialogueOpen: open }),

  selectedDynasties: [],
  toggleDynasty: (id) =>
    set((s) => ({
      selectedDynasties: s.selectedDynasties.includes(id)
        ? s.selectedDynasties.filter((d) => d !== id)
        : [...s.selectedDynasties, id],
    })),

  revealedLines: [],
  setRevealedLines: (lines) => set({ revealedLines: lines }),
}))
