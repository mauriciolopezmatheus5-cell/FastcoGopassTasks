import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/organisms/Navbar';
import { Sidebar } from '@/components/organisms/Sidebar';
import { useUIStore } from '@/store/ui.store';

export const DashboardLayout: React.FC = () => {
  const sidebarAbierto = useUIStore((s) => s.sidebarAbierto);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <div className="min-h-screen bg-background-app">
      <Navbar />

      <div className="flex">
        <Sidebar />

        {sidebarAbierto && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden z-30"
            onClick={() => toggleSidebar()}
          />
        )}

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
