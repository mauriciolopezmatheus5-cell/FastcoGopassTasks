import { create } from 'zustand';

interface UIState {
  sidebarAbierto: boolean;
  toggleSidebar: () => void;
  cerrarSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarAbierto: false,
  toggleSidebar: () => set((state) => ({ sidebarAbierto: !state.sidebarAbierto })),
  cerrarSidebar: () => set({ sidebarAbierto: false }),
}));
