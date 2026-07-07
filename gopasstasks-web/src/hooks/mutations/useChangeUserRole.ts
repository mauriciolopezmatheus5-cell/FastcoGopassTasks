import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface ChangeRolePayload {
  userId: string;
  roleId: string;
}

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: ChangeRolePayload) =>
      api.patch(`/v1/admin/users/${userId}/role`, { roleId }),
    onSuccess: () => {
      toast.success('Rol actualizado correctamente.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => {
      toast.error('No se pudo actualizar el rol.');
    },
  });
};
