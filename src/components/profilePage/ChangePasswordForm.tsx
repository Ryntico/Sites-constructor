import React, { useState, useEffect } from 'react';
import { Button, PasswordInput, Stack, Text, Group, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useChangePassword, type ChangePasswordValues } from '@hooks/useChangePassword';

interface ChangePasswordFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess, onCancel }) => {
	const { changePassword, isLoading, error, success, reset } = useChangePassword();
	const [showForm, setShowForm] = useState(true);

	const form = useForm<ChangePasswordValues>({
		initialValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		validate: {
			currentPassword: (value) => (value ? null : 'Введите текущий пароль'),
			newPassword: (value) => (value && value.length >= 6 ? null : 'Пароль должен содержать не менее 6 символов'),
			confirmPassword: (value, values) => {
				if (!value) return 'Подтвердите новый пароль';
				if (value !== values.newPassword) return 'Пароли не совпадают';
				return null;
			},
		},
		validateInputOnBlur: true,
	});

	useEffect(() => {
		if (showForm) {
			form.reset();
			reset();
		}
	}, [showForm]);

	useEffect(() => {
		if (success) {
			setShowForm(false);
			onSuccess?.();
		}
	}, [success, onSuccess]);

	const handleSubmit = async (values: ChangePasswordValues) => {
		const validation = form.validate();
		if (Object.keys(validation.errors).length > 0) {
			console.log('Form validation errors:', validation.errors);
			return;
		}

		try {
			const success = await changePassword(values.currentPassword, values.newPassword);
			if (success) {
				setShowForm(false);
				onSuccess?.();
			}
		} catch (err) {
			console.error('Error in handleSubmit:', err);
		}
	};

	const handleReset = () => {
		form.reset();
		reset();
		setShowForm(true);
	};

	if (!showForm) {
		return (
			<Stack>
				<Alert color="green" title="Готово!">
					Пароль успешно изменен.
				</Alert>
				<Button onClick={handleReset} variant="subtle">
					Изменить пароль снова
				</Button>
			</Stack>
		);
	}

	return (
		<Stack gap="md">
			<Text fw={500} size="sm">Смена пароля</Text>

			{error && (
				<Alert color="red" mb="md">
					{error}
				</Alert>
			)}

			<PasswordInput
				label="Текущий пароль"
				placeholder="Введите текущий пароль"
				{...form.getInputProps('currentPassword')}
				disabled={isLoading}
				required
			/>

			<PasswordInput
				label="Новый пароль"
				placeholder="Введите новый пароль"
				{...form.getInputProps('newPassword')}
				disabled={isLoading}
				required
			/>

			<PasswordInput
				label="Подтвердите новый пароль"
				placeholder="Повторите новый пароль"
				{...form.getInputProps('confirmPassword')}
				disabled={isLoading}
				required
			/>

			<Group justify="flex-end" mt="md">
				{onCancel && (
					<Button
						variant="default"
						onClick={onCancel}
						disabled={isLoading}
						type="button"
					>
						Отмена
					</Button>
				)}
				<Button
					type="submit"
					variant="subtle"
					loading={isLoading}
					onClick={() => handleSubmit(form.values)}
					disabled={!form.isDirty() || !form.isValid()}
				>
					Изменить пароль
				</Button>
			</Group>
		</Stack>
	);
};
