import React from 'react';
import type { RoleDto } from '@/types/admin.types';

interface RoleSelectorProps {
  roles: RoleDto[];
  value: string;
  onChange: (roleId: string) => void;
  disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ roles, value, onChange, disabled = false }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className="block w-full rounded-md border border-border bg-background-card px-3 py-2 text-sm text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-slate-50"
  >
    {roles.map((role) => (
      <option key={role.id} value={role.id}>
        {role.name}
      </option>
    ))}
  </select>
);
