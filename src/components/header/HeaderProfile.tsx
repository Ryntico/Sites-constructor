import { Menu, Avatar } from '@mantine/core';
import { notifications, type NotificationData } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { getRouteProfile, getRouteLogin } from '@/const/router.ts';
import { useLogOut } from '@/hooks/useLogOut.ts';

export const HeaderProfile = () => {
	const navigate = useNavigate();
	const { isLoading, handleSubmit } = useLogOut();

	const logoutReject = () => {
		// в доке color есть и работает, но в типы не добавили
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
					src="https://i.pinimg.com/474x/6d/a8/e6/6da8e6d1456bfb1345cfaedf4690448e.jpg"
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
