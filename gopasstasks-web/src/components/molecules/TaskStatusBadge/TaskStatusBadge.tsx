import React from 'react';
import { Badge } from '@/components/atoms/Badge';
import { TASK_STATUS_LABELS, TASK_STATUS_STYLES, TaskStatus } from '@/types/task.types';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  const label = TASK_STATUS_LABELS[status];
  const className = TASK_STATUS_STYLES[status];

  return (
    <Badge className={className}>
      {label}
    </Badge>
  );
};
