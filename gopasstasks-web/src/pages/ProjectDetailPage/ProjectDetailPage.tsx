import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/queries/useProject';
import { TaskBoard } from '@/components/organisms/TaskBoard';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { TaskForm } from '@/components/organisms/TaskForm';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const { data: project, isLoading, error } = useProject(id || '');

  if (!id) return <div>Project ID not found</div>;
  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (error) return <div className="text-red-600">Error al cargar proyecto</div>;
  if (!project) return <div>Proyecto no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{project.name}</h1>
          <p className="text-text-secondary mt-1">{project.description}</p>
        </div>
        <Button onClick={() => setShowNewTaskModal(true)}>
          + Nueva Tarea
        </Button>
      </div>

      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background-card rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-text-primary">Nueva Tarea</h2>
            <TaskForm
              projectId={id}
              onSuccess={() => setShowNewTaskModal(false)}
            />
          </div>
        </div>
      )}

      <TaskBoard projectId={id} onTaskClick={(taskId) => navigate(`/tasks/${taskId}`)} />
    </div>
  );
};
