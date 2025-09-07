import React from 'react';
import { Stack, Text, Image, ActionIcon, Box, Group, Avatar } from '@mantine/core';
import { type UpdateProfileValues } from '@hooks/useUpdateProfile.ts';

interface ProfileView {
	user: UpdateProfileValues;
	editCallback: VoidFunction;
}

export const ProfileView: React.FC<ProfileView> = ({ user, editCallback }) => {
	return (
		<Stack gap="xl" align="center">
			<Box w="100%">
				<Group justify="right">
					<ActionIcon size="lg" radius="xl" color="blue" onClick={editCallback}>
						✏️
					</ActionIcon>
				</Group>
			</Box>

			<Box>
				{user.avatarUrl &&
					<Image
						src={user.avatarUrl}
						alt="Profile avatar"
						width={240}
						height={240}
						radius="xl"
						style={{ border: '2px solid #000' }}
					/>
				}
				{!user.avatarUrl &&
					<Avatar size="xxl" radius="xl" />
				}

			</Box>

			<Stack gap="md" align="center">
				<Text size="xl" fw={600} ta="center">
					{`${user.firstName} ${user.lastName}`}
				</Text>
				<Text size="lg" c="dimmed" ta="center">
					{user.email}
				</Text>
			</Stack>
		</Stack>
	);
};
