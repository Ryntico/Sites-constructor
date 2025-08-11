import { useState } from 'react';
import { signIn } from '../services/firebase/auth';

interface LoginFormValues {
  email: string;
  password: string;
}

interface UseLoginReturn {
  loading: boolean;
  error: string | null;
  handleSubmit: (values: LoginFormValues, successCallback?: VoidFunction) => Promise<void>;
}

export const useLogin = (): UseLoginReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormValues, successCallback?: VoidFunction) => {
    try {
      setError(null);
      setLoading(true);

      await signIn(values.email, values.password);
      // TODO добавить логику ?
      successCallback?.();
    } catch (err) {
      const errorMessage = err instanceof Error && err.message.includes('invalid-credential') ?
          'неверный логин или пароль': 'ошибка на стороне сервера';
      setError(errorMessage);
    }
    setLoading(false);
  };

  return {
    loading,
    error,
    handleSubmit,
  };
};
