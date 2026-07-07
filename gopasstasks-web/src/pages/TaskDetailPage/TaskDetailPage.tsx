import React from 'react';
import { useParams } from 'react-router-dom';
import { useTask } from '@/hooks/queries/useTask';
import { useWorkLogs } from '@/hooks/queries/useWorkLogs';
import { useUpdateTaskStatus } from '@/hooks/mutations/useUpdateTaskStatus';
import { useLogWork } from '@/hooks/mutations/useLogWork';
import { useAssignTaskMember } from '@/hooks/mutations/useAssignTaskMember';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/atoms/Button';
import { TaskStatusBadge } from '@/components/molecules/TaskStatusBadge';
import { PriorityIndicator } from '@/components/molecules/PriorityIndicator';
import { Avatar } from '@/components/atoms/Avatar';
import { Spinner } from '@/components/atoms/Spinner';
import { FormField } from '@/components/molecules/FormField';
import { useForm } from 'react-hook-form';
import { TASK_STATUS_TRANSITIONS, TaskStatus } from '@/types/task.types';
import { toast } from 'sonner';

interface LogWorkData {
  timeSpentMinutes: number;
  description: string;
}

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const usuario = useAuthStore((state) => state.usuario);
  const { data: task, isLoading, error } = useTask(id || '');
  const { data: workLogs = [] } = useWorkLogs(id || '');
  const { mutate: updateStatus } = useUpdateTaskStatus();
  const { mutate: logWork, isPending: isLoggingWork } = useLogWork();
  const { mutate: assignMember, isPending: isAssigning } = useAssignTaskMember();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LogWorkData>();

  if (!id) return <div>Task ID not found</div>;
  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (error) return <div className="text-red-600">Error al cargar tarea</div>;
  if (!task) return <div>Tarea no encontrada</div>;

  // Verificar si el usuario actual está asignado a la tarea
  const isUserAssigned = task.assignedMembers?.some(m => m.userId === usuario?.id);

  const validTransitions = TASK_STATUS_TRANSITIONS[task.status] || [];

  const onChangeStatus = (newStatus: TaskStatus) => {
    updateStatus(
      { taskId: id, status: newStatus },
      { onSuccess: () => toast.success('Estado actualizado') }
    );
  };

  const onAssignToMe = () => {
    if (!usuario?.id) return;
    assignMember({ taskId: id, userId: usuario.id });
  };

  const onSubmitWorkLog = (data: LogWorkData) => {
    logWork(
      { taskId: id, ...data },
      {
        onSuccess: () => {
          reset();
          toast.success('Tiempo registrado');
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{task.title}</h1>
        <p className="text-text-secondary mt-2">{task.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-sm text-text-secondary">Estado</h3>
          <div className="mt-2 flex items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <div className="space-x-2">
              {validTransitions.map((newStatus) => (
                <Button
                  key={newStatus}
                  size="sm"
                  variant="outline"
                  onClick={() => onChangeStatus(newStatus)}
                >
                  → {newStatus}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-text-secondary">Prioridad</h3>
          <div className="mt-2">
            <PriorityIndicator priority={task.priority} />
          </div>
        </div>
      </div>

      {/* Miembros asignados */}
      <div className="bg-background-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-text-primary mb-3">
              Miembros asignados ({task.assignedMembers?.length || 0})
            </h3>
            <div className="space-y-2">
              {task.assignedMembers && task.assignedMembers.length > 0 ? (
                task.assignedMembers.map((member) => (
                  <div key={member.userId} className="flex items-center gap-2">
                    <Avatar
                      size="sm"
                      initials={member.name.substring(0, 2).toUpperCase()}
                      alt={member.name}
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{member.name}</p>
                      <p className="text-xs text-text-muted">{member.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-muted">Sin miembros asignados</p>
              )}
            </div>
          </div>
          {!isUserAssigned && (
            <Button
              size="sm"
              onClick={onAssignToMe}
              isLoading={isAssigning}
              className="whitespace-nowrap"
            >
              Asignarme
            </Button>
          )}
        </div>
      </div>

      {/* Registrar tiempo */}
      <div className="bg-background-muted rounded-lg p-4">
        <h3 className="font-semibold text-sm text-text-primary mb-3">Registrar tiempo</h3>
        {!isUserAssigned ? (
          <p className="text-sm text-red-600 mb-4">
            ⚠️ Debes estar asignado a la tarea para registrar tiempo.
          </p>
        ) : null}
        <form onSubmit={handleSubmit(onSubmitWorkLog)} className="space-y-3">
          <FormField
            label="Minutos"
            type="number"
            error={errors.timeSpentMinutes?.message}
            disabled={!isUserAssigned || isLoggingWork}
            {...register('timeSpentMinutes', { required: 'Requerido', valueAsNumber: true })}
          />
          <FormField
            label="Descripción (opcional)"
            as="textarea"
            error={errors.description?.message}
            disabled={!isUserAssigned || isLoggingWork}
            {...register('description')}
          />
          <Button 
            type="submit" 
            isLoading={isLoggingWork} 
            size="sm"
            disabled={!isUserAssigned}
          >
            Registrar
          </Button>
        </form>
      </div>

      {/* Registros de tiempo */}
      <div>
        <h3 className="font-semibold text-sm text-text-primary mb-3">
          Registros de tiempo ({workLogs.length}) - Total: {task.workLogTotal} min
        </h3>
        {workLogs.length > 0 ? (
          <div className="space-y-2">
            {workLogs.map((log) => (
              <div key={log.id} className="bg-background-muted rounded-lg p-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-text-primary">{log.userName}</span>
                  <span className="text-text-muted font-semibold">{log.timeSpentMinutes} min</span>
                </div>
                {log.description && (
                  <p className="text-text-secondary text-xs mb-1">{log.description}</p>
                )}
                <p className="text-text-muted text-xs">
                  {new Date(log.recordedAt).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">Sin registros de tiempo aún</p>
        )}
      </div>
    </div>
  );
};
