import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { RoleSelector } from '@/components/molecules/RoleSelector/RoleSelector';
import { useCreateUser } from '@/hooks/mutations/useCreateUser';
import { useChangeUserRole } from '@/hooks/mutations/useChangeUserRole';
import type { AdminUserDto, RoleDto } from '@/types/admin.types';

/* ─── Schemas ─────────────────────────────────────────────────── */

const createSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Ingresa un correo electrónico válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  roleId: z.string().uuid('Selecciona un rol válido.'),
});

const editSchema = z.object({
  roleId: z.string().uuid('Selecciona un rol válido.'),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

/* ─── Props ────────────────────────────────────────────────────── */

interface UserFormModalProps {
  mode: 'create' | 'edit';
  /** Requerido cuando mode === 'edit' */
  user?: AdminUserDto;
  roles: RoleDto[];
  open: boolean;
  onClose: () => void;
}

/* ─── Component ────────────────────────────────────────────────── */

/**
 * Modal para crear o editar un usuario desde el panel de administración.
 *
 * - Modo "create": campos name, email, password y role.
 * - Modo "edit": muestra nombre y email del usuario (solo lectura), permite cambiar el rol.
 */
export const UserFormModal: React.FC<UserFormModalProps> = ({
  mode,
  user,
  roles,
  open,
  onClose,
}) => {
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: changeRole, isPending: isChangingRole } = useChangeUserRole();

  const isPending = isCreating || isChangingRole;

  /* ── Create form ── */
  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '', password: '', roleId: roles[0]?.id ?? '' },
  });

  /* ── Edit form ── */
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { roleId: user?.role.id ?? '' },
  });

  // Sincronizar roleId cuando cambia el usuario seleccionado
  useEffect(() => {
    if (mode === 'edit' && user) {
      editForm.reset({ roleId: user.role.id });
    }
  }, [user, mode, editForm]);

  // Resetear el form de creación cuando el modal se abre
  useEffect(() => {
    if (open && mode === 'create') {
      createForm.reset({ name: '', email: '', password: '', roleId: roles[0]?.id ?? '' });
    }
  }, [open, mode, createForm, roles]);

  if (!open) return null;

  /* ── Handlers ── */

  const handleCreate = (values: CreateFormValues) => {
    createUser(values, { onSuccess: onClose });
  };

  const handleEdit = (values: EditFormValues) => {
    if (!user) return;
    changeRole({ userId: user.id, roleId: values.roleId }, { onSuccess: onClose });
  };

  /* ── Render ── */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-background-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {mode === 'create' ? (
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                label="Nombre completo"
                error={createForm.formState.errors.name?.message}
                {...createForm.register('name')}
              />
              <FormField
                label="Correo electrónico"
                type="email"
                error={createForm.formState.errors.email?.message}
                {...createForm.register('email')}
              />
              <FormField
                label="Contraseña"
                type="password"
                error={createForm.formState.errors.password?.message}
                {...createForm.register('password')}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-primary">Rol</label>
                <RoleSelector
                  roles={roles}
                  value={createForm.watch('roleId')}
                  onChange={(roleId) => createForm.setValue('roleId', roleId)}
                />
                {createForm.formState.errors.roleId && (
                  <p className="text-xs text-red-500">{createForm.formState.errors.roleId.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isPending}>
                  Crear Usuario
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              {/* Información de solo lectura */}
              <div className="rounded-lg bg-background-muted px-4 py-3 space-y-2">
                <div>
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Nombre</span>
                  <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Correo</span>
                  <p className="text-sm text-text-secondary">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-primary">Rol</label>
                <RoleSelector
                  roles={roles}
                  value={editForm.watch('roleId')}
                  onChange={(roleId) => editForm.setValue('roleId', roleId)}
                />
                {editForm.formState.errors.roleId && (
                  <p className="text-xs text-red-500">{editForm.formState.errors.roleId.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isPending}>
                  Guardar Cambios
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
