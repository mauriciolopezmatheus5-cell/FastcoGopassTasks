import React from 'react';
import { getPriorityLevel, PRIORITY_LABELS, PRIORITY_STYLES } from '@/types/task.types';

interface PriorityIndicatorProps {
  priority: number;
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ priority }) => {
  const level = getPriorityLevel(priority);
  const label = PRIORITY_LABELS[level];
  const className = PRIORITY_STYLES[level];

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
};
