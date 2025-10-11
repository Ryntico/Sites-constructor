import { Menu, Avatar } from '@mantine/core';
import { notifications, type NotificationData } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { getRouteProfile, getRouteLogin } from '@/const/router.ts';
import { useLogOut } from '@/hooks/useLogOut.ts';
import { useAppSelector } from '@store/hooks.ts';
import { selectAuth } from '@store/slices/authSlice.ts';

export const HeaderProfile = () => {
	const navigate = useNavigate();
	const { isLoading, handleSubmit } = useLogOut();
	const { user } = useAppSelector(selectAuth);

	const logoutReject = () => {
		notifications.show({
			title: 'Ошибка выхода',
			message: 'Попробуйте еще раз!',
			color: 'red',
		} as NotificationData);
	};

	const handleLogout = () => {
		void handleSubmit(() => navigate(getRouteLogin()), logoutReject);
	};

	return (
		<Menu shadow="md" width={200}>
			<Menu.Target>
				<Avatar
					src={user?.avatarUrl}
					size="md"
					radius="xl"
					style={{ cursor: 'pointer' }}>
				</Avatar>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item onClick={() => navigate(getRouteProfile())}>Профиль</Menu.Item>
				<Menu.Item onClick={handleLogout} color="red" disabled={isLoading}>
					Выход
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};
