import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signUp } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface UseSignupReturn {
  loading: boolean;
  error: string | null;
  handleSubmit: (values: Omit<SignupFormValues, 'confirmPassword'>, successCallback?: VoidFunction) => Promise<void>;
}

export const useSignup = (): UseSignupReturn => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);
  const loading = status === 'loading';

  const handleSubmit = useCallback(async (values: Omit<SignupFormValues, 'confirmPassword'>, successCallback?: VoidFunction) => {
    try {
      const resultAction = await dispatch(signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName
      }));

      if (signUp.fulfilled.match(resultAction)) {
        navigate('/');
        successCallback?.();
      }
    } catch (err) {
      // Ошибка уже обработана в слайсе
      console.error('Registration error:', err);
    }
  }, [dispatch, navigate]);

  return {
    loading,
    error,
    handleSubmit,
  };
};
