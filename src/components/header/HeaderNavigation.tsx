import { Group, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { getRouteExistingProject, getRouteMain } from '@/const/router.ts';
import { useAppSelector } from '@/store/hooks.ts';
import { selectAuth } from '@/store/slices/authSlice.ts';
import { useSiteBuilder } from '@/hooks/useSiteBuilder.ts';
import { useState } from 'react';

export const HeaderNavigation = () => {
	const [isCreating, setIsCreating] = useState(false);
	const navigate = useNavigate();
	const { user } = useAppSelector(selectAuth);
	const { createEmptySiteId } = useSiteBuilder('', 'home');

	return (
		<Group wrap="nowrap">
			<Button
				variant="subtle"
				c="gray"
				onClick={() => navigate(getRouteMain())}
			>
				Главная
			</Button>
			<Button
				variant="subtle"
				c="gray"
				loading={isCreating}
				onClick={async () => {
					try {
						setIsCreating(true);
						const newId = await createEmptySiteId({
							ownerId: user?.uid,
							siteName: 'Мой сайт',
							firstPageId: 'home',
							firstPageTitle: 'Home',
							firstPageRoute: '/',
						});
						navigate(getRouteExistingProject(newId));
					} finally {
						setIsCreating(false);
					}
				}}
			>
				Новый сайт
			</Button>
		</Group>
	);
};
