import React from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { useCreateTask } from '@/hooks/mutations/useCreateTask';
import { toast } from 'sonner';

interface TaskFormProps {
  projectId: string;
  onSuccess?: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: number;
  estimatedTimeMin: number;
}

export const TaskForm: React.FC<TaskFormProps> = ({ projectId, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>();
  const { mutate: createTask, isPending } = useCreateTask(projectId);

  const onSubmit = (data: TaskFormData) => {
    createTask(
      { ...data, projectId },
      {
        onSuccess: () => {
          reset();
          onSuccess?.();
          toast.success('Tarea creada');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Título"
        placeholder="Título de la tarea"
        error={errors.title?.message}
        {...register('title', { required: 'El título es requerido', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
      />

      <FormField
        label="Descripción"
        placeholder="Descripción (opcional)"
        as="textarea"
        error={errors.description?.message}
        {...register('description')}
      />

      <FormField
        label="Prioridad (-100 a 100)"
        type="number"
        error={errors.priority?.message}
        {...register('priority', { required: 'Requerido', valueAsNumber: true })}
      />

      <FormField
        label="Tiempo estimado (minutos)"
        type="number"
        error={errors.estimatedTimeMin?.message}
        {...register('estimatedTimeMin', { required: 'Requerido', valueAsNumber: true })}
      />

      <Button type="submit" isLoading={isPending} className="w-full">
        Crear tarea
      </Button>
    </form>
  );
};
