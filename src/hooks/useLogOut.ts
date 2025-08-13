import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks.ts';
import { signOut, selectAuth } from '@store/slices/authSlice';

interface LogOutReturn {
	isLoading: boolean;
	error: string | null;
	handleSubmit: (
		successCallback?: VoidFunction,
		rejectCallback?: VoidFunction,
	) => Promise<void>;
}

export const useLogOut = (): LogOutReturn => {
	const dispatch = useAppDispatch();
	const { status } = useAppSelector(selectAuth);
	const isLoading = status === 'loading';
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (successCallback, rejectCallback) => {
		try {
			setError(null);

			await dispatch(signOut()).unwrap();
			successCallback?.();
		} catch (err) {
			rejectCallback?.();
			setError(err);
		}
	};

	return {
		isLoading,
		error,
		handleSubmit,
	};
};
