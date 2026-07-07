import React from 'react';

interface RoleBadgeProps {
  role: string;
}

const roleConfig: Record<string, { label: string; className: string }> = {
  ADMIN: { label: 'Admin', className: 'bg-primary-light text-primary' },
  DEVELOPER: { label: 'Developer', className: 'bg-blue-100 text-blue-700' },
  VIEWER: { label: 'Viewer', className: 'bg-background-muted text-text-secondary' },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const config = roleConfig[role] ?? { label: role, className: 'bg-background-muted text-text-secondary' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};
