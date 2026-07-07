import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { TaskDetailPage } from '@/pages/TaskDetailPage';
import { AdminPage } from '@/pages/AdminPage/AdminPage';

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Root - redirige a /projects o /login según autenticación */}
      <Route index element={<Navigate to="/projects" replace />} />

      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/projects" element={<DashboardPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/admin/users" element={<AdminPage />} />
        </Route>
      </Route>

      {/* Fallback - redirige a login si no encuentra ruta */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);
