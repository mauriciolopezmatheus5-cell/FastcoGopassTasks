import React from 'react';
import { TaskStatusBadge } from '@/components/molecules/TaskStatusBadge';
import { PriorityIndicator } from '@/components/molecules/PriorityIndicator';
import { Avatar } from '@/components/atoms/Avatar';
import { TaskStatus } from '@/types/task.types';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number;
  dueDate?: string;
  createdAt?: string;
  assignedTo?: Array<{ id: string; name: string }>;
  assignedMembers?: Array<{ userId: string; name: string; email: string }>;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  createdAt,
  assignedTo,
  assignedMembers,
  onClick,
  onDelete,
  onEdit,
}) => {
  const members = assignedMembers ? assignedMembers.map(m => ({ id: m.userId, name: m.name })) : (assignedTo || []);
  const dueDateObj = dueDate ? new Date(dueDate) : null;
  const isOverdue = dueDateObj && dueDateObj < new Date();
  const createdAtObj = createdAt ? new Date(createdAt) : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(id);
  };

  return (
    <div
      onClick={onClick}
      className="bg-background-card rounded-lg border border-border p-4 cursor-pointer hover:shadow-card-hover transition-shadow pointer-events-auto"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-text-primary flex-1 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <TaskStatusBadge status={status} />
            {onEdit && (
              <button
                onClick={handleEdit}
                title="Editar tarea"
                className="p-1 rounded text-text-subtle hover:text-primary hover:bg-primary-light transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                title="Eliminar tarea"
                className="p-1 rounded text-text-subtle hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {description && (
          <p className="text-xs text-text-muted line-clamp-2">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <PriorityIndicator priority={priority} />
          {dueDateObj && (
            <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-text-muted'}`}>
              Vence: {dueDateObj.toLocaleDateString('es-ES')}
            </span>
          )}
        </div>

        {members.length > 0 && (
          <div className="flex items-center gap-1">
            {members.slice(0, 3).map((user) => (
              <Avatar
                key={user.id}
                alt={user.name}
                size="sm"
                initials={user.name.substring(0, 2).toUpperCase()}
              />
            ))}
            {members.length > 3 && (
              <span className="text-xs text-text-muted">+{members.length - 3}</span>
            )}
          </div>
        )}

        {createdAtObj && (
          <p className="text-xs text-text-subtle border-t border-border-subtle pt-2">
            Creada: {createdAtObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
};
