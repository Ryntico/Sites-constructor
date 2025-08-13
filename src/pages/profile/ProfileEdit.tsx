import React from 'react';
import { Stack, TextInput, Image, ActionIcon, Box, Group, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { type UpdateProfileValues, useUpdateProfile } from '@hooks/useUpdateProfile.ts';

interface ProfileEditProps {
	user: UpdateProfileValues;
	onSave: () => void;
	onCancel: () => void;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onSave }) => {
	const { handleUpdateProfile, isLoading, error } = useUpdateProfile();

	const form = useForm<UpdateProfileValues>({
		initialValues: {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
		},
		validate: {
			firstName: (value) =>
				value?.trim().length === 0 ? 'Поле не должно быть пустым' : null,
			lastName: (value) =>
				value?.trim().length === 0 ? 'Поле не должно быть пустым' : null,
			email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Некорректный email'),
		},
	});

	const handleSubmit = async () => {
		const values = form.values;
		const isError = form.validate().hasErrors;
		if (!isError) {
			handleUpdateProfile(values, onSave);
		}
	};

	return (
		<Stack gap="xl" align="center">
			<Box w="100%">
				<Group justify="right">
					<ActionIcon
						size="lg"
						radius="xl"
						color="green"
						onClick={handleSubmit}
						loading={isLoading}
					>
						✓
					</ActionIcon>
				</Group>
			</Box>

			<Box>
				<Image
					src="https://i.pinimg.com/474x/6d/a8/e6/6da8e6d1456bfb1345cfaedf4690448e.jpg"
					alt="Profile avatar"
					width={240}
					height={240}
					radius="xl"
					style={{ border: '2px solid #000' }}
				/>
			</Box>

			<Box w="100%">
				<form>
					<Stack gap="lg">
						<TextInput
							label="Имя"
							placeholder="Имя"
							size="md"
							key={form.key('firstName')}
							{...form.getInputProps('firstName')}
						/>

						<TextInput
							label="Фамилия"
							placeholder="Фамилия"
							size="md"
							key={form.key('lastName')}
							{...form.getInputProps('lastName')}
						/>

						<TextInput
							label="Электронная почта"
							placeholder="Электронная почта"
							size="md"
							key={form.key('email')}
							{...form.getInputProps('email')}
						/>
					</Stack>
					{error && !isLoading && (
						<Alert title={error} color="red" variant="light" mt="xs" />
					)}
				</form>
			</Box>
		</Stack>
	);
};
