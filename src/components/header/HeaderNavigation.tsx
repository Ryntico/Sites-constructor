import { Group, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { getRouteExistingProject, getRouteMain } from '@/const/router.ts';
import { useAppSelector } from '@store/hooks.ts';
import { selectAuth } from '@store/slices/authSlice.ts';
import { useSiteBuilder } from '@hooks/useSiteBuilder.ts';

export const HeaderNavigation = () => {
	const navigate = useNavigate();
	const { user } = useAppSelector(selectAuth);
	const { createEmptySiteId, createSiteFromTemplateId } = useSiteBuilder('', 'home');

	return (
		<Group>
			<Button variant="subtle" onClick={() => navigate(getRouteMain())}>
				Главная
			</Button>
			<Button variant="subtle"
					onClick={async () => {
						const newId = await createEmptySiteId({
							ownerId: user?.uid,
							siteName: 'Мой сайт',
							firstPageId: 'home',
							firstPageTitle: 'Home',
							firstPageRoute: '/',
						});
						navigate(getRouteExistingProject(newId));
					}}
			>
				Новый сайт
			</Button>
			<Button
				variant="subtle"
				onClick={async () => {
					const id = await createSiteFromTemplateId({
						ownerId: user?.uid,
						name: 'Demo site',
						templateId: 'base-smoke',
					});
					navigate(getRouteExistingProject(id));
				}}
			>
				Создать сайт из base-smoke
			</Button>
		</Group>
	);
};
