import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProject } from '@/hooks/mutations/useCreateProject';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { toast } from 'sonner';

// Validación del formulario
const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional()
    .or(z.literal('')),
});

type CreateProjectFormValues = z.infer<typeof CreateProjectSchema>;

interface ProjectFormProps {
  onSuccess: () => void;
}

/**
 * Formulario para crear un nuevo proyecto
 */
export const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess }) => {
  const { mutate: crearProyecto, isPending } = useCreateProject();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(CreateProjectSchema),
  });

  const onSubmit = (valores: CreateProjectFormValues) => {
    setError(null);
    crearProyecto(
      {
        name: valores.name,
        description: valores.description || '',
      },
      {
        onSuccess: () => {
          toast.success('Proyecto creado exitosamente');
          reset();
          onSuccess();
        },
        onError: (error: any) => {
          const mensaje =
            error?.response?.data?.mensaje || 'Error al crear el proyecto';
          setError(mensaje);
          toast.error(mensaje);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <FormField
        label="Nombre del proyecto"
        placeholder="Mi proyecto"
        error={errors.name?.message}
        {...register('name')}
      />

      <FormField
        label="Descripción (opcional)"
        placeholder="Descripción del proyecto..."
        error={errors.description?.message}
        as="textarea"
        {...register('description')}
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'Creando...' : 'Crear Proyecto'}
        </Button>
      </div>
    </form>
  );
};
