import React, { useState } from 'react';
import { RoleBadge } from '@/components/molecules/RoleBadge/RoleBadge';
import { RoleSelector } from '@/components/molecules/RoleSelector/RoleSelector';
import { Button } from '@/components/atoms/Button/Button';
import { useChangeUserRole } from '@/hooks/mutations/useChangeUserRole';
import { useDeactivateUser } from '@/hooks/mutations/useDeactivateUser';
import type { AdminUserDto, RoleDto } from '@/types/admin.types';

interface UserTableProps {
  users: AdminUserDto[];
  roles: RoleDto[];
  onEdit: (user: AdminUserDto) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, roles, onEdit }) => {
  const [pendingRoleChange, setPendingRoleChange] = useState<Record<string, string>>({});
  const { mutate: changeRole, isPending: isChangingRole } = useChangeUserRole();
  const { mutate: deactivateUser, isPending: isDeactivating } = useDeactivateUser();

  const handleRoleChange = (userId: string, roleId: string) => {
    setPendingRoleChange((prev) => ({ ...prev, [userId]: roleId }));
  };

  const handleConfirmRoleChange = (userId: string) => {
    const roleId = pendingRoleChange[userId];
    if (!roleId) return;
    changeRole(
      { userId, roleId },
      {
        onSuccess: () => {
          setPendingRoleChange((prev) => {
            const next = { ...prev };
            delete next[userId];
            return next;
          });
        },
      },
    );
  };

  const handleDeactivate = (userId: string, userName: string) => {
    if (!window.confirm(`¿Desactivar al usuario "${userName}"? Esta acción puede revertirse asignando un nuevo rol.`)) return;
    deactivateUser(userId);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background-card shadow-card">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-background-muted">
          <tr>
            {['Usuario', 'Email', 'Rol', 'Proyectos', 'Tareas', 'Estado', 'Registro', 'Acciones'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background-card">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-background-muted transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text-primary">{user.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-text-muted">{user.email}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <RoleSelector
                    roles={roles}
                    value={pendingRoleChange[user.id] ?? user.role.id}
                    onChange={(roleId) => handleRoleChange(user.id, roleId)}
                    disabled={!user.isActive}
                  />
                  {pendingRoleChange[user.id] !== undefined && pendingRoleChange[user.id] !== user.role.id && (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={isChangingRole}
                      onClick={() => handleConfirmRoleChange(user.id)}
                    >
                      Guardar
                    </Button>
                  )}
                </div>
                <div className="mt-1">
                  <RoleBadge role={user.role.name} />
                </div>
              </td>
              <td className="px-4 py-3 text-center text-sm text-text-secondary">{user.projectCount}</td>
              <td className="px-4 py-3 text-center text-sm text-text-secondary">{user.taskCount}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-text-muted">
                {new Date(user.createdAt).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(user)}
                  >
                    Editar
                  </Button>
                  {user.isActive && (
                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={isDeactivating}
                      onClick={() => handleDeactivate(user.id, user.name)}
                    >
                      Desactivar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
