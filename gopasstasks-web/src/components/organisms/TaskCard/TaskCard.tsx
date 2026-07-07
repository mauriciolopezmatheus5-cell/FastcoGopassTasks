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
  assignedTo?: Array<{ id: string; name: string }>;
  assignedMembers?: Array<{ userId: string; name: string; email: string }>;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  status,
  priority,
  dueDate,
  assignedTo,
  assignedMembers,
  onClick,
}) => {
  // Usar assignedMembers del backend si está disponible, si no usar assignedTo (compat)
  const members = assignedMembers ? assignedMembers.map(m => ({ id: m.userId, name: m.name })) : (assignedTo || []);
  const dueDateObj = dueDate ? new Date(dueDate) : null;
  const isOverdue = dueDateObj && dueDateObj < new Date();

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
          <TaskStatusBadge status={status} />
        </div>

        {description && (
          <p className="text-xs text-text-muted line-clamp-2">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <PriorityIndicator priority={priority} />
          {dueDateObj && (
            <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-text-muted'}`}>
              {dueDateObj.toLocaleDateString('es-ES')}
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
      </div>
    </div>
  );
};
