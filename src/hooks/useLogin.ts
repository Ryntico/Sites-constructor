import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signIn } from '../store/slices/authSlice';

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
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const loading = status === 'loading';

  const handleSubmit = useCallback(async (values: LoginFormValues, successCallback?: VoidFunction) => {
    try {
      const resultAction = await dispatch(signIn({
        email: values.email,
        password: values.password
      }));

      if (signIn.fulfilled.match(resultAction)) {
        successCallback?.();
      }
    } catch (err) {
      // Ошибка уже обработана в слайсе
      console.error('Login error:', err);
    }
  }, [dispatch]);

  return {
    loading,
    error,
    handleSubmit,
  };
};
