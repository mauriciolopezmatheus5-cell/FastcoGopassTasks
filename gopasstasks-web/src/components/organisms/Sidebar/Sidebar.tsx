import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarAbierto = useUIStore((s) => s.sidebarAbierto);
  const cerrarSidebar = useUIStore((s) => s.cerrarSidebar);
  const usuario = useAuthStore((s) => s.usuario);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/projects', label: 'Proyectos', icon: '📋' },
    { path: '/tasks', label: 'Tareas', icon: '✓' },
    ...(usuario?.role === 'ADMIN'
      ? [{ path: '/admin/users', label: 'Usuarios', icon: '👥' }]
      : []),
  ];

  return (
    <aside
      className={`fixed md:relative left-0 top-0 h-screen w-sidebar bg-background-sidebar border-r border-border p-4 transform transition-transform md:translate-x-0 ${
        sidebarAbierto ? 'translate-x-0' : '-translate-x-full'
      } z-40 md:z-0`}
    >
      <button
        onClick={cerrarSidebar}
        className="md:hidden absolute top-4 right-4 text-text-secondary hover:text-text-primary"
      >
        ✕
      </button>

      <nav className="space-y-2 mt-8 md:mt-0">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={cerrarSidebar}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive(item.path)
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-background-muted'
            }`}
          >
            <span>{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
