import { useState } from 'react';
import { signUp } from '../services/firebase/auth';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (values: Omit<SignupFormValues, 'confirmPassword'>, successCallback?: VoidFunction) => {
    try {
      setError(null);
      setLoading(true);

      const { firstName, lastName, email, password } = values;
      const displayName = `${firstName} ${lastName}`.trim();
      
      await signUp(email, password, displayName);

      navigate('/');
      successCallback?.();
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? 
        (err.message.includes('email-already-in-use') ? 
          'Пользователь с таким email уже зарегистрирован' : 
          'Произошла ошибка при регистрации') : 
        'Неизвестная ошибка';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleSubmit,
  };
};
