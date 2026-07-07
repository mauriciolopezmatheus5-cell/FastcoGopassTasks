import { create } from 'zustand';

export interface UsuarioDto {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuthState {
  usuario: UsuarioDto | null;
  setUsuario: (usuario: UsuarioDto) => void;
  limpiarSesion: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  setUsuario: (usuario) => set({ usuario }),
  limpiarSesion: () => set({ usuario: null }),
}));
