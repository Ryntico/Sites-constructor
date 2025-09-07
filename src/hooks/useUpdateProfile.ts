import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile, updateEmail, updateAvatar } from '@/store/slices/authSlice';
import { useState } from 'react';

export interface UpdateProfileValues {
	firstName: string;
	lastName: string;
	email: string;
	avatarUrl?: string;
}

interface UseUpdateProfileReturn {
	isLoading: boolean;
	error: string | null;
	handleUpdateProfile: (
		values: UpdateProfileValues,
		successCallback?: VoidFunction,
	) => Promise<void>;
}

export const useUpdateProfile = (): UseUpdateProfileReturn => {
	const dispatch = useAppDispatch();
	const { status, user } = useAppSelector((state) => state.auth);
	const isLoading = status === 'loading';
	const [error, setError] = useState<string | null>(null);

	const handleUpdateProfile = async (
		values: UpdateProfileValues,
		successCallback?: VoidFunction,
	): Promise<void> => {
		setError(null);
		const needUpdateProfile =
			values.firstName !== user?.firstName || values.lastName !== user?.lastName;
		const needUpdateEmail = values.email !== user?.email;
		const needUpdateAvatar = values.avatarUrl !== user?.avatarUrl && 
			(values.avatarUrl !== undefined || user?.avatarUrl !== undefined);

		const { email, avatarUrl, ...userName } = values;

		const promises = [];
		let profileIdx: number | null = null;
		let emailIdx: number | null = null;
		let avatarIdx: number | null = null;

		if (needUpdateProfile) {
			profileIdx = promises.length;
			promises.push(dispatch(updateProfile(userName)).unwrap());
		}
		if (needUpdateEmail) {
			emailIdx = promises.length;
			promises.push(dispatch(updateEmail({ email })).unwrap());
		}
		if (needUpdateAvatar) {
			avatarIdx = promises.length;
			promises.push(dispatch(updateAvatar({ avatarUrl })).unwrap());
		}

		if (promises.length === 0) {
			successCallback?.();
			return;
		}

		try {
			const results = await Promise.allSettled(promises);

			const profileOk =
				profileIdx !== null ? results[profileIdx].status === 'fulfilled' : null;
			const emailOk =
				emailIdx !== null ? results[emailIdx].status === 'fulfilled' : null;
			const avatarOk =
				avatarIdx !== null ? results[avatarIdx].status === 'fulfilled' : null;

			let errorMsg = '';
			if (profileIdx !== null && results[profileIdx].status === 'rejected') {
				errorMsg += 'Ошибка обновления профиля.\n';
			}
			if (emailIdx !== null && results[emailIdx].status === 'rejected') {
				const reason = (results[emailIdx] as PromiseRejectedResult).reason;
				if (typeof reason === 'string' && reason.includes('verify')) {
					errorMsg +=
						'Пожалуйста, подтвердите новый email через письмо, прежде чем менять email.';
				} else {
					errorMsg += 'Ошибка обновления email';
				}
			}
			if (avatarIdx !== null && results[avatarIdx].status === 'rejected') {
				errorMsg += '\nОшибка обновления аватара';
			}

			if (profileOk !== false && emailOk !== false && avatarOk !== false) {
				setError(null);
				successCallback?.();
			} else {
				setError(errorMsg.trim());
			}
		} catch (err) {
			setError('Произошла ошибка при обновлении профиля');
			console.error('Error updating profile:', err);
		}
	};

	return {
		isLoading,
		error,
		handleUpdateProfile,
	};
};