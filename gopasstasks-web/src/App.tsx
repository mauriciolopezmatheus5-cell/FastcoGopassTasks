import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { AppRouter } from '@/router/AppRouter';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/axios';

export const App: React.FC = () => {
  const setUsuario = useAuthStore((s) => s.setUsuario);

  // Verify session only once on app mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const { data } = await api.get('/v1/users/me');
        if (isMounted) {
          setUsuario(data);
        }
      } catch {
        // No session, user must login
        // The interceptor will have already cleared the session if needed
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array: solo ejecutar una vez al montar

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster />
    </QueryClientProvider>
  );
};
