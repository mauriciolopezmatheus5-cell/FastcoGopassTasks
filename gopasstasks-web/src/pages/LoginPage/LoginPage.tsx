import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const setUsuario = useAuthStore((s) => s.setUsuario);
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const [isPending, setIsPending] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      navigate('/projects');
    }
  }, [usuario, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsPending(true);
    setLoginError(null);
    try {
      const response = await api.post('/v1/auth/login', data);
      setUsuario(response.data.user);
      navigate('/projects');
      toast.success('Sesión iniciada');
    } catch (error: any) {
      const mensaje = error.response?.data?.mensaje || 'Error al iniciar sesión';
      setLoginError(mensaje);
      toast.error(mensaje);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {loginError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {loginError}
          </div>
        )}

        <FormField
          label="Email"
          type="email"
          placeholder="tu@email.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'El email es requerido',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
          })}
        />

        <FormField
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'La contraseña es requerida',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          })}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>

        <p className="text-xs text-center text-text-muted">
          Demo: admin@gopasstasks.com / Admin1234!
        </p>
      </form>
    </div>
  );
};
