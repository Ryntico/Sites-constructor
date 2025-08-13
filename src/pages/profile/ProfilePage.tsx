import React, { useState } from 'react';
import { Container, Paper } from '@mantine/core';
import { ProfileView } from './ProfileView.tsx';
import { ProfileEdit } from './ProfileEdit.tsx';
import { selectAuth } from '@store/slices/authSlice.ts';
import { useAppSelector } from '@store/hooks.ts';

export const ProfilePage = () => {
	const [isEditing, setIsEditing] = useState(false);
	const { user } = useAppSelector(selectAuth);

	const handleEdit = () => setIsEditing(true);
	const handleSave = () => setIsEditing(false);

	const authData = {
		email: user?.email,
		lastName: user?.lastName,
		firstName: user?.firstName,
	};

	return (
		<Container size="xs" py="xl">
			<Paper shadow="sm" p="xl" radius="md" withBorder>
				{isEditing ? (
					<ProfileEdit user={authData} onSave={handleSave} />
				) : (
					<ProfileView user={authData} editCallback={handleEdit} />
				)}
			</Paper>
		</Container>
	);
};
