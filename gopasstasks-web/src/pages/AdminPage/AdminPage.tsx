import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useAdminUsers } from '@/hooks/queries/useAdminUsers';
import { useRoles } from '@/hooks/queries/useRoles';
import { UserTable } from '@/components/organisms/UserTable/UserTable';
import { UserFormModal } from '@/components/organisms/UserFormModal';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { Button } from '@/components/atoms/Button/Button';
import type { AdminUserDto } from '@/types/admin.types';

export const AdminPage: React.FC = () => {
  const usuario = useAuthStore((s) => s.usuario);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUserDto) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const { data: usersData, isLoading: loadingUsers } = useAdminUsers({ page, limit: 10, roleId: roleFilter });
  const { data: roles = [], isLoading: loadingRoles } = useRoles();

  // Redirect non-admin users — hooks must be called before this
  if (usuario !== null && usuario.role !== 'ADMIN') {
    return <Navigate to="/projects" replace />;
  }

  const isLoading = loadingUsers || loadingRoles;

  return (
    <div className="min-h-screen bg-background-app">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Administración de Usuarios</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Gestiona los usuarios del sistema y sus roles de acceso.
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate}>
            + Nuevo Usuario
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-text-primary">Filtrar por rol:</span>
          {['Todos', 'ADMIN', 'DEVELOPER', 'VIEWER'].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r === 'Todos' ? undefined : roles.find((ro) => ro.name === r)?.id);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                (r === 'Todos' && roleFilter === undefined) ||
                (r !== 'Todos' && roleFilter === roles.find((ro) => ro.name === r)?.id)
                  ? 'bg-primary text-white'
                  : 'bg-background-card text-text-secondary hover:bg-background-muted border border-border'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !usersData || usersData.data.length === 0 ? (
          <div className="rounded-xl border border-border bg-background-card py-16 text-center">
            <p className="text-text-muted">No se encontraron usuarios.</p>
          </div>
        ) : (
          <>
            <UserTable users={usersData.data} roles={roles} onEdit={handleOpenEdit} />

            {usersData.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-text-muted">
                  Mostrando {(page - 1) * 10 + 1}–{Math.min(page * 10, usersData.total)} de {usersData.total} usuarios
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === usersData.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <UserFormModal
        mode={selectedUser ? 'edit' : 'create'}
        user={selectedUser ?? undefined}
        roles={roles}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};
