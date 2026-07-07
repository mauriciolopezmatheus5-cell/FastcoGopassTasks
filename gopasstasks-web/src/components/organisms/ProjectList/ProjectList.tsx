import React from 'react';
import { useProjects } from '@/hooks/queries/useProjects';
import { Spinner } from '@/components/atoms/Spinner';

interface ProjectListProps {
  onProjectClick?: (projectId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onProjectClick }) => {
  const { data: projects = [], isLoading, error } = useProjects();

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm">Error al cargar proyectos</div>;
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => onProjectClick?.(project.id)}
          className="bg-background-card rounded-lg border border-border p-3 cursor-pointer hover:bg-background-muted transition-colors"
        >
          <h4 className="font-semibold text-sm text-text-primary">{project.name}</h4>
          <p className="text-xs text-text-muted">{project.description}</p>
          <div className="flex gap-4 mt-2 text-xs text-text-muted">
            <span>{project.memberCount} miembros</span>
            <span>{project.taskCount} tareas</span>
          </div>
        </div>
      ))}
    </div>
  );
};
