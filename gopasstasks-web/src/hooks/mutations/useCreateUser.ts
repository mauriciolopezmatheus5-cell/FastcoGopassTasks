import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  /** UUID del rol a asignar al usuario */
  roleId: string;
}

/**
 * Mutation para crear un nuevo usuario desde el panel de administración.
 *
 * Flujo:
 * 1. POST /api/v1/auth/register  → crea el usuario con rol DEVELOPER por defecto y devuelve su ID
 * 2. PATCH /api/v1/admin/users/:id/role → asigna el rol seleccionado por el admin
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, email, password, roleId }: CreateUserPayload) => {
      const { data } = await api.post<{ mensaje: string; userId: string }>('/v1/auth/register', {
        name,
        email,
        password,
      });
      // Asignar el rol seleccionado (incluso si es DEVELOPER, es idempotente)
      await api.patch(`/v1/admin/users/${data.userId}/role`, { roleId });
      return data;
    },
    onSuccess: () => {
      toast.success('Usuario creado correctamente.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { mensaje?: string } } };
      const mensaje = axiosError?.response?.data?.mensaje ?? 'No se pudo crear el usuario.';
      toast.error(mensaje);
    },
  });
};
