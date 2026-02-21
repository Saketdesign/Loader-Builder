import { create } from 'zustand';
import type { LoaderConfig, CanvasTransform } from './types';

interface AppState {
  loaders: LoaderConfig[];
  selectedLoaderId: string | null;
  canvasTransform: CanvasTransform;
  isBuilderMode: boolean; // Global toggle for builder UI overlay

  // Actions
  addLoader: (loader: LoaderConfig) => void;
  updateLoader: (id: string, updates: Partial<LoaderConfig>) => void;
  removeLoader: (id: string) => void;
  selectLoader: (id: string | null) => void;
  setCanvasTransform: (transform: Partial<CanvasTransform>) => void;
  toggleBuilderMode: () => void;

  // Helpers
  duplicateLoader: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  loaders: [],
  selectedLoaderId: null,
  canvasTransform: { x: 0, y: 0, scale: 1 },
  isBuilderMode: false,

  addLoader: (loader: LoaderConfig) =>
    set((state) => ({
      loaders: [...state.loaders, loader],
      selectedLoaderId: loader.id,
    })),

  updateLoader: (id, updates) =>
    set((state) => ({
      loaders: state.loaders.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    })),

  removeLoader: (id) =>
    set((state) => ({
      loaders: state.loaders.filter((l) => l.id !== id),
      selectedLoaderId:
        state.selectedLoaderId === id ? null : state.selectedLoaderId,
    })),

  selectLoader: (id) => set({ selectedLoaderId: id }),

  setCanvasTransform: (transform) =>
    set((state) => ({
      canvasTransform: { ...state.canvasTransform, ...transform },
    })),

  toggleBuilderMode: () =>
    set((state) => ({ isBuilderMode: !state.isBuilderMode })),

  duplicateLoader: (id) =>
    set((state) => {
      const loader = state.loaders.find((l) => l.id === id);
      if (!loader) return state;

      const newLoader: LoaderConfig = {
        ...loader,
        id: crypto.randomUUID(),
        position: { x: loader.position.x + 50, y: loader.position.y + 50 },
        text: `${loader.text} (Copy)`,
      };

      return {
        loaders: [...state.loaders, newLoader],
        selectedLoaderId: newLoader.id,
      };
    }),
}));
