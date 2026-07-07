import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background-card rounded-lg shadow-card p-8 border border-border">
        <div className="text-center mb-8">
          <img src="/assets/branding/logo-full.svg" alt="GopassTasks" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary">GopassTasks</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
