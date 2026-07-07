import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectList } from '@/components/organisms/ProjectList';
import { ProjectForm } from '@/components/organisms/ProjectForm';
import { Button } from '@/components/atoms/Button';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const handleProjectCreated = () => {
    setShowNewProjectModal(false);
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-text-primary">Proyectos</h1>
          <Button onClick={() => setShowNewProjectModal(true)}>
            + Nuevo Proyecto
          </Button>
        </div>

        {showNewProjectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background-card rounded-lg p-6 w-full max-w-md shadow-card-hover">
              <h2 className="text-xl font-bold mb-4 text-text-primary">Nuevo Proyecto</h2>
              <ProjectForm onSuccess={handleProjectCreated} />
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="w-full mt-4 text-sm text-text-muted hover:text-text-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <ProjectList onProjectClick={(id) => navigate(`/projects/${id}`)} />
      </div>
  );
};
