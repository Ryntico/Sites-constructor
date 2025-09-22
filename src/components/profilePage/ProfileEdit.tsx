import React, { useCallback, useState } from 'react';
import { Stack, TextInput, Image, ActionIcon, Box, Group, Alert, FileButton, Avatar, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { type UpdateProfileValues, useUpdateProfile } from '@hooks/useUpdateProfile.ts';
import { useImageUpload } from '@hooks/useImageUpload.ts';
import { useAppSelector } from '@store/hooks.ts';
import { ChangePasswordForm } from '@components/profilePage/ChangePasswordForm';

interface ProfileEditProps {
	user: UpdateProfileValues;
	onSave: () => void;
	onCancel?: () => void;
}

const IconCameraPlus = () =>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="48"
		height="48"
		viewBox="0 0 24 24"
		fill="none"
		stroke="#ffffff"
		strokeWidth="1"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 20h-7a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v3.5" />
		<path d="M16 19h6" />
		<path d="M19 16v6" />
		<path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
	</svg>

const IconTrash = () =>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="48"
		height="48"
		viewBox="0 0 24 24"
		fill="none"
		stroke="#ffffff"
		strokeWidth="1"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M4 7l16 0" />
		<path d="M10 11l0 6" />
		<path d="M14 11l0 6" />
		<path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
		<path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
	</svg>


export const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onSave }) => {
	const { handleUpdateProfile, isLoading, error } = useUpdateProfile();
	const currentUser = useAppSelector((state) => state.auth.user);

	const { upload, progress, isUploading } = useImageUpload();

	const form = useForm<UpdateProfileValues>({
		initialValues: {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			avatarUrl: user.avatarUrl,
		},
		validate: {
			firstName: (value) =>
				value?.trim().length === 0 ? 'Поле не должно быть пустым' : null,
			lastName: (value) =>
				value?.trim().length === 0 ? 'Поле не должно быть пустым' : null,
			email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Некорректный email'),
		},
	});

	const [showPasswordForm, setShowPasswordForm] = useState(false);

	const togglePasswordForm = () => {
		setShowPasswordForm(!showPasswordForm);
	};

	const handlePasswordChangeSuccess = () => {
		setShowPasswordForm(false);
	};

	const handleFileChange = useCallback(
		async (file: File | null) => {
			if (!file || !currentUser?.uid) return;

			try {
				const result = await upload(currentUser.uid, file, {
					maxBytes: 2 * 1024 * 1024, // 2MB
					allowedMime: ['image/jpeg', 'image/png', 'image/webp'],
				});
				form.setFieldValue('avatarUrl', result.url);
			} catch (err) {
				console.error('Failed to upload image:', err);
			}
		},
		[upload, currentUser?.uid, form.setFieldValue]
	);

	const handleRemoveAvatar = useCallback(() => {
		form.setFieldValue('avatarUrl', '');
	}, [form]);

	const handleSubmit = async () => {
		const values = form.values;
		const isError = form.validate().hasErrors;
		if (!isError) {
			handleUpdateProfile(values, onSave);
		}
	};

	const avatarUrl = form.values.avatarUrl;

	return (
			<Stack gap="xl" align="center">
				<Box pos="relative" w={240} h={240}>
					{avatarUrl &&
						<Image
							src={avatarUrl}
							alt="Profile avatar"
							width={240}
							height={240}
							radius="xl"
							style={{ border: '2px solid #000' }}
						/>
					}
					{!avatarUrl &&
						<Avatar size="xxl" radius="xl" />
					}
					<Group
						gap="xs"
						justify="center"
						pos="absolute"
						bottom={-20}
						left={0}
						right={0}
					>
						<FileButton onChange={handleFileChange} accept="image/png,image/jpeg,image/webp">
							{(props) => (
								<ActionIcon
									{...props}
									variant="filled"
									color="blue"
									loading={isUploading}
									size="lg"
									radius="xl"
									title="Изменить аватар"
								>
									<IconCameraPlus/>
								</ActionIcon>
							)}
						</FileButton>
						{avatarUrl && (
							<ActionIcon
								variant="filled"
								color="red"
								size="lg"
								radius="xl"
								onClick={handleRemoveAvatar}
								disabled={isUploading}
								title="Удалить аватар"
							>
								<IconTrash/>
							</ActionIcon>
						)}
					</Group>
				</Box>

				{isUploading && (
					<Box w="100%" ta="center">
						Загрузка: {Math.round(progress)}%
					</Box>
				)}

				<Box w="100%">
					<form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
						<Stack gap="lg">
							<TextInput
								label="Имя"
								placeholder="Имя"
								size="md"
								key={form.key('firstName')}
								{...form.getInputProps('firstName')}
								disabled={isLoading || isUploading}
							/>

							<TextInput
								label="Фамилия"
								placeholder="Фамилия"
								size="md"
								key={form.key('lastName')}
								{...form.getInputProps('lastName')}
								disabled={isLoading || isUploading}
							/>

							<TextInput
								label="Электронная почта"
								placeholder="Электронная почта"
								size="md"
								key={form.key('email')}
								{...form.getInputProps('email')}
								disabled={isLoading || isUploading}
							/>

							<Group justify="space-between" mt="md">
								<Button
									variant="subtle"
									onClick={togglePasswordForm}
									type="button"
								>
									{showPasswordForm ? 'Скрыть смену пароля' : 'Изменить пароль'}
								</Button>

								<Button
									variant="subtle"
									color="green"
									type="submit"
									loading={isLoading}
								>
									Сохранить профиль
								</Button>
							</Group>

							{showPasswordForm && (
								<Box p="md" style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}>
									<ChangePasswordForm onSuccess={handlePasswordChangeSuccess} />
								</Box>
							)}
						</Stack>
						{error && !isLoading && (
							<Alert title={error} color="red" variant="light" mt="xs" />
						)}
					</form>
				</Box>
			</Stack>
	);
};
