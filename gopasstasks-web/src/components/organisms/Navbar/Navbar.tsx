import React from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/atoms/Button';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const usuario = useAuthStore((s) => s.usuario);
  const limpiarSesion = useAuthStore((s) => s.limpiarSesion);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/v1/auth/logout');
      limpiarSesion();
      navigate('/login');
      toast.success('Sesión cerrada');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <nav className="bg-background-card border-b border-border px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h1 className="font-bold text-lg text-text-primary">Fastco GopassTasks</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-text-secondary">{usuario?.name}</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
};
