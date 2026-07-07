import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

/**
 * Componente de ruta protegida.
 * 
 * Verifica que exista un usuario autenticado en el store antes de
 * renderizar la ruta solicitada. Si no hay sesión activa, redirige
 * automáticamente al login.
 */
export const ProtectedRoute: React.FC = () => {
  const usuario = useAuthStore((s) => s.usuario);

  // Si no hay usuario autenticado, redirigir al login
  if (usuario === null) {
    return <Navigate to="/login" replace />;
  }

  // Usuario autenticado - renderizar las rutas protegidas
  return <Outlet />;
};
