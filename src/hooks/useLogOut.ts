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

const toErrorMessage = (err: unknown): string => {
	if (err instanceof Error) return err.message;
	if (typeof err === 'string') return err;
	try {
		return JSON.stringify(err);
	} catch {
		return 'Unknown error';
	}
};

export const useLogOut = (): LogOutReturn => {
	const dispatch = useAppDispatch();
	const { status } = useAppSelector(selectAuth);
	const isLoading = status === 'loading';
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (
		successCallback?: VoidFunction,
		rejectCallback?: VoidFunction,
	): Promise<void> => {
		try {
			setError(null);

			await dispatch(signOut()).unwrap();
			successCallback?.();
			localStorage.removeItem('currentSiteId');
		} catch (err: unknown) {
			rejectCallback?.();
			setError(toErrorMessage(err));
		}
	};

	return {
		isLoading,
		error,
		handleSubmit,
	};
};
