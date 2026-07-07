import axios, { type AxiosError } from 'axios';
import { toast } from 'sonner';
import { ENV } from '@/config/env';
import { useAuthStore } from '@/store/auth.store';

export const api = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ mensaje?: string }>) => {
    const status = error.response?.status;
    const mensajeServidor = error.response?.data?.mensaje;

    if (status === 401) {
      // Limpiar la sesión del usuario en el store (sin redirigir)
      // La redirección la maneja el router basado en el estado del store
      useAuthStore.getState().limpiarSesion();
      return Promise.reject(error);
    }
    if (status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
      return Promise.reject(error);
    }
    if (status === 409) {
      toast.error(mensajeServidor ?? 'Ya existe un recurso con estos datos.');
      return Promise.reject(error);
    }
    if (status !== undefined && status >= 500) {
      toast.error('Ocurrió un error inesperado. Por favor, inténtalo más tarde.');
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);
