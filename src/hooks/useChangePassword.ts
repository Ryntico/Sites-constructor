import { useState } from 'react';
import { 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  type AuthError
} from 'firebase/auth';
import { auth } from '@/services/firebase/app';

export const useChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      setError('Пользователь не авторизован');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      
      setSuccess(true);
      return true;
      
    } catch (err) {
      const error = err as AuthError;
      console.error('Ошибка при смене пароля:', {
        code: error.code,
        message: error.message
      });
      
      switch (error.code) {
        case 'auth/wrong-password':
          setError('Неверный текущий пароль');
          break;
        case 'auth/weak-password':
          setError('Пароль должен содержать не менее 6 символов');
          break;
        case 'auth/requires-recent-login':
          setError('Сессия устарела. Пожалуйста, войдите заново.');
          break;
        default:
          setError('Произошла ошибка при смене пароля');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    changePassword, 
    isLoading, 
    error, 
    success, 
    reset: () => {
      setError(null);
      setSuccess(false);
    }
  };
};

export type ChangePasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
